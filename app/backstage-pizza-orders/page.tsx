"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, LogOut, Bell, Sparkles, RefreshCw, ChevronDown, ChevronUp, Check, Play, CheckCircle } from "lucide-react";

type OrderItemRelation = {
  id: string;
  item_name: string;
  price: number;
  quantity: number;
};

type OrderWithItems = {
  id: string;
  customer_name: string;
  table_number: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  total_amount: number;
  created_at: string;
  order_items: OrderItemRelation[];
};

export default function BackstageOrdersPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check sessionStorage on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isUnlocked = sessionStorage.getItem("admin_unlocked") === "true";
      if (isUnlocked) {
        setUnlocked(true);
      }
    }
  }, []);

  // Fetch orders and their items
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          customer_name,
          table_number,
          status,
          total_amount,
          created_at,
          order_items (
            id,
            item_name,
            price,
            quantity
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (err) {
      console.error("Error fetching backstage orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) {
      fetchOrders();
    }
  }, [unlocked]);

  // Realtime subscription
  useEffect(() => {
    if (!unlocked) return;

    const playNotificationSound = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
        gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.45);
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    };

    const channel = supabase
      .channel("backstage-orders-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // Add a minor delay before fetching to guarantee line items exist
          setTimeout(() => {
            fetchOrders();
          }, 350);

          if (payload.eventType === "INSERT") {
            setFlash(true);
            playNotificationSound();
            setTimeout(() => setFlash(false), 1500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unlocked]);

  // Handle PIN entry
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        sessionStorage.setItem("admin_unlocked", "true");
        setUnlocked(true);
        setPinError("");
      } else {
        setPinError("Incorrect PIN. Access denied.");
      }
    } catch {
      setPinError("Verification error. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_unlocked");
    setUnlocked(false);
    setPin("");
  };

  // Status progression action
  const handleStatusUpdate = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", orderId);

      if (error) throw error;
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper: format relative time
  const getRelativeTime = (isoString: string) => {
    const orderTime = new Date(isoString).getTime();
    const now = new Date().getTime();
    const diffMin = Math.round((now - orderTime) / 60000);
    
    if (diffMin < 1) return "just now";
    if (diffMin === 1) return "1 min ago";
    return `${diffMin} mins ago`;
  };

  // Stats calculation
  const newOrdersCount = orders.filter((o) => o.status === "pending").length;
  const inProgressCount = orders.filter((o) => o.status === "preparing" || o.status === "ready").length;

  const todayRevenue = orders
    .filter((o) => {
      if (o.status === "cancelled") return false;
      const orderDate = new Date(o.created_at).toDateString();
      const todayDate = new Date().toDateString();
      return orderDate === todayDate;
    })
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Grouping orders
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-200 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <Lock size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Backstage Orders Access</h1>
            <p className="text-sm text-slate-500 mt-1">Please enter the security PIN to proceed</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                required
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                className="w-full text-center tracking-widest text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl py-3 text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {pinError && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3 text-center font-medium">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-850 transition-colors shadow-sm text-sm"
            >
              Verify PIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans transition-all duration-500 ${flash ? "bg-amber-50" : ""}`}>
      {/* Alert Banner for New Orders */}
      {flash && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
          <Bell size={18} className="animate-swing" />
          <span>NEW ORDER RECEIVED!</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              Backstage Orders <Sparkles size={20} className="text-amber-500" />
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time order coordination & kitchen tracking</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl transition-colors shadow-sm"
              title="Refresh Orders"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 font-medium text-sm shadow-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Summary Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Orders</div>
            <div className="text-3xl font-bold text-amber-600 mt-2 flex items-baseline gap-2">
              {newOrdersCount}
              {newOrdersCount > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Action Required</span>}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{inProgressCount}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">${todayRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Order Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* New Orders Column */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[400px]">
            <h2 className="text-sm font-bold text-amber-750 uppercase tracking-wide mb-4 px-1 flex items-center justify-between">
              <span>New / Pending</span>
              <span className="bg-amber-250 text-amber-800 text-xs px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
            </h2>
            <div className="space-y-4 overflow-y-auto flex-1">
              {pendingOrders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-5 shadow-sm transition-all">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{order.table_number}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.customer_name}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                      {getRelativeTime(order.created_at)}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 pb-3">
                    <ul className="space-y-1.5">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="text-xs text-slate-700 flex justify-between">
                          <span>
                            <strong className="text-slate-900 font-semibold">{item.quantity}x</strong> {item.item_name}
                          </span>
                          <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-4">
                    <div className="text-sm font-bold text-slate-800">${Number(order.total_amount).toFixed(2)}</div>
                    <button
                      onClick={() => handleStatusUpdate(order.id, "preparing")}
                      disabled={updatingId === order.id}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Play size={12} /> Start Preparing
                    </button>
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200">
                  No pending orders.
                </div>
              )}
            </div>
          </div>

          {/* Preparing Orders Column */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[400px]">
            <h2 className="text-sm font-bold text-blue-750 uppercase tracking-wide mb-4 px-1 flex items-center justify-between">
              <span>Preparing</span>
              <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">{preparingOrders.length}</span>
            </h2>
            <div className="space-y-4 overflow-y-auto flex-1">
              {preparingOrders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm transition-all">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{order.table_number}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.customer_name}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                      {getRelativeTime(order.created_at)}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 pb-3">
                    <ul className="space-y-1.5">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="text-xs text-slate-700 flex justify-between">
                          <span>
                            <strong className="text-slate-900 font-semibold">{item.quantity}x</strong> {item.item_name}
                          </span>
                          <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-4">
                    <div className="text-sm font-bold text-slate-800">${Number(order.total_amount).toFixed(2)}</div>
                    <button
                      onClick={() => handleStatusUpdate(order.id, "ready")}
                      disabled={updatingId === order.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Check size={12} /> Mark Ready
                    </button>
                  </div>
                </div>
              ))}
              {preparingOrders.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200">
                  No orders preparing.
                </div>
              )}
            </div>
          </div>

          {/* Ready Orders Column */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[400px]">
            <h2 className="text-sm font-bold text-emerald-750 uppercase tracking-wide mb-4 px-1 flex items-center justify-between">
              <span>Ready for Table</span>
              <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-0.5 rounded-full">{readyOrders.length}</span>
            </h2>
            <div className="space-y-4 overflow-y-auto flex-1">
              {readyOrders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-5 shadow-sm transition-all">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{order.table_number}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.customer_name}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                      {getRelativeTime(order.created_at)}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 pb-3">
                    <ul className="space-y-1.5">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="text-xs text-slate-700 flex justify-between">
                          <span>
                            <strong className="text-slate-900 font-semibold">{item.quantity}x</strong> {item.item_name}
                          </span>
                          <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-4">
                    <div className="text-sm font-bold text-slate-800">${Number(order.total_amount).toFixed(2)}</div>
                    <button
                      onClick={() => handleStatusUpdate(order.id, "completed")}
                      disabled={updatingId === order.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Serve & Complete
                    </button>
                  </div>
                </div>
              ))}
              {readyOrders.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200">
                  No orders ready to serve.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Completed Orders Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-12">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex justify-between items-center px-6 py-5 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm uppercase tracking-wide border-none"
          >
            <span className="flex items-center gap-2">
              Completed / Cancelled Orders
              <span className="bg-slate-100 text-slate-550 text-xs px-2 py-0.5 rounded-full font-medium normal-case">
                {completedOrders.length} records
              </span>
            </span>
            {showCompleted ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showCompleted && (
            <div className="border-t border-slate-150 p-6 bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <div className="font-bold text-slate-700">{order.table_number}</div>
                        <div className="text-xs text-slate-400">{order.customer_name}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === "completed" ? "bg-slate-100 text-slate-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-3 pb-3">
                      <ul className="space-y-1">
                        {order.order_items.map((item) => (
                          <li key={item.id} className="text-xs text-slate-500">
                            <strong>{item.quantity}x</strong> {item.item_name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between text-xs text-slate-500 font-medium">
                      <span>Total: ${Number(order.total_amount).toFixed(2)}</span>
                      <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
                {completedOrders.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-sm col-span-full">
                    No completed or cancelled orders today.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
