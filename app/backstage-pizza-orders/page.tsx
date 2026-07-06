"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, LogOut, Bell, Sparkles, RefreshCw, CheckCircle } from "lucide-react";

type OrderItemRelation = {
  id: string;
  menu_item_id: string | null;
  item_name: string;
  price: number;
  quantity: number;
  menu_item?: {
    image_url: string | null;
  };
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isUnlocked = sessionStorage.getItem("admin_unlocked") === "true";
      if (isUnlocked) setUnlocked(true);
    }
  }, []);

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
            menu_item_id,
            item_name,
            price,
            quantity,
            menu_item (image_url)
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
    if (unlocked) fetchOrders();
  }, [unlocked]);

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
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
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
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
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
          setTimeout(() => fetchOrders(), 350);
          if (payload.eventType === "INSERT") {
            setFlash(true);
            playNotificationSound();
            setTimeout(() => setFlash(false), 1500);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [unlocked]);

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

  const handleMarkCompleted = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);
      if (error) throw error;
      fetchOrders();
    } catch (err) {
      console.error("Error marking order completed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getRelativeTime = (isoString: string) => {
    const orderTime = new Date(isoString).getTime();
    const now = new Date().getTime();
    const diffMin = Math.round((now - orderTime) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin === 1) return "1 min ago";
    return `${diffMin} mins ago`;
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const newOrdersCount = pendingOrders.length;
  const todayRevenue = orders
    .filter((o) => {
      if (o.status === "cancelled") return false;
      const orderDate = new Date(o.created_at).toDateString();
      const todayDate = new Date().toDateString();
      return orderDate === todayDate;
    })
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

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
      {flash && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
          <Bell size={18} className="animate-swing" />
          <span>NEW ORDER RECEIVED!</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Orders</div>
            <div className="text-3xl font-bold text-amber-600 mt-2 flex items-baseline gap-2">
              {newOrdersCount}
              {newOrdersCount > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Action Required</span>}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">${todayRevenue.toFixed(2)}</div>
          </div>
        </div>

        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
              <p className="text-sm text-slate-500 mt-1">Pending orders are listed below in the order they were received.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">{pendingOrders.length} pending</span>
          </div>

          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
                No pending orders at the moment.
              </div>
            ) : (
              pendingOrders.map((order) => {
                const firstItem = order.order_items[0];
                const imageUrl = firstItem?.menu_item?.image_url || "";
                const orderLabel = order.order_items.length > 1 ? `${firstItem?.item_name} + ${order.order_items.length - 1} more` : firstItem?.item_name;
                return (
                  <div key={order.id} className="flex flex-col md:flex-row gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm md:items-center">
                    <div className="h-32 w-full md:w-36 rounded-3xl overflow-hidden bg-slate-100">
                      <img src={imageUrl} alt={orderLabel || "Order image"} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.32em] text-slate-400 font-semibold">{orderLabel}</p>
                          <h3 className="text-lg font-semibold text-slate-900 mt-2">{order.customer_name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase tracking-[0.25em]">{order.table_number}</p>
                          <p className="text-xs text-slate-500 mt-1">{getRelativeTime(order.created_at)}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-white border border-slate-200 p-3">
                          <span className="block text-xs text-slate-400">Total</span>
                          <span className="font-semibold text-slate-900">${Number(order.total_amount).toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => handleMarkCompleted(order.id)}
                          disabled={updatingId === order.id}
                          className="rounded-2xl bg-emerald-600 text-white px-4 py-3 text-sm font-semibold transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CheckCircle size={16} className="inline-block mr-2" /> Mark Completed
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
