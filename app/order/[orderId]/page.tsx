"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, OrderItem } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, CircleDot, Clock3, Truck, Sparkles } from "lucide-react";

type OrderStatusPageProps = {
  params: {
    orderId: string;
  };
};

type OrderDetails = {
  id: string;
  customer_name: string;
  table_number: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  total_amount: number;
  created_at: string;
  estimated_ready_at?: string | null;
  order_items: OrderItem[];
};

const progressSteps = [
  { key: "pending", label: "Order Received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Served" },
];

const statusToStepIndex: Record<string, number> = {
  pending: 0,
  confirmed: 0,
  preparing: 1,
  ready: 2,
  completed: 3,
  cancelled: 0,
};

export default function OrderStatusPage({ params }: OrderStatusPageProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  const orderId = params.orderId;

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `id, customer_name, table_number, status, total_amount, created_at, estimated_ready_at, order_items(id, item_name, price, quantity)`
        )
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data as OrderDetails);
    } catch (err: any) {
      console.error("Error loading order status:", err);
      setError(err?.message || "Unable to load order status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = useMemo(() => {
    if (!order) return 0;
    return statusToStepIndex[order.status] ?? 0;
  }, [order]);

  const countdownText = useMemo(() => {
    if (!order || order.status !== "preparing" || !order.estimated_ready_at) return null;
    const diff = new Date(order.estimated_ready_at).getTime() - now.getTime();
    if (diff <= 0) return "Ready any moment now.";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `Ready in about ${minutes}m ${seconds}s`;
  }, [order, now]);

  const friendlyMessage = useMemo(() => {
    if (!order) return null;
    if (order.status === "ready") {
      return `Your pizza is ready! Our team will bring it to table ${order.table_number}.`;
    }
    if (order.status === "completed") {
      return `Enjoy your meal! Your order was served to table ${order.table_number}.`;
    }
    if (order.status === "pending" || order.status === "confirmed") {
      return "Your order is received and will be prepared shortly.";
    }
    if (order.status === "preparing") {
      return countdownText || "The kitchen is working on your order.";
    }
    return null;
  }, [order, countdownText]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand pt-28 pb-16">
        <Navbar />
        <div className="max-w-5xl mx-auto px-5 md:px-8 text-center py-24">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-white/90 border border-slate-200 px-8 py-6 shadow-sm">
            <Sparkles className="text-ochre w-8 h-8" />
            <div>
              <p className="text-slate-700 font-semibold">Loading your order status...</p>
              <p className="text-slate-500 text-sm">Please wait while we connect to the kitchen.</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-sand pt-28 pb-16">
        <Navbar />
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-24 text-center">
          <div className="rounded-3xl bg-white border border-rose-100 p-10 shadow-sm">
            <p className="text-rose-600 font-semibold">Unable to load order status.</p>
            <p className="text-slate-500 mt-3">{error || "Please check your link or ask a staff member for help."}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand pt-28 pb-16">
      <Navbar />
      <main className="max-w-6xl mx-auto px-5 md:px-8">
        <section className="bg-cream border border-tide/10 rounded-[2rem] p-6 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ochre font-semibold">Order status</p>
              <h1 className="mt-3 text-3xl md:text-4xl font-display text-tide">Table {order.table_number}</h1>
              <p className="mt-2 text-slate-600 max-w-xl">Track your pizza as it moves from kitchen to table with live updates.</p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 px-5 py-4 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order ID</p>
              <p className="mt-2 font-semibold text-slate-900 break-all">{order.id}</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex flex-col gap-4 md:gap-6">
              {progressSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                        isComplete
                          ? "bg-tide text-white"
                          : isActive
                          ? "bg-ochre text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{step.label}</div>
                      <div className="text-xs text-slate-500">{isComplete ? "Completed" : isActive ? "Current" : "Pending"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400 font-semibold">Live progress</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{order.status === "ready" ? "Your pizza is ready" : order.status === "completed" ? "Enjoy your meal" : order.status === "preparing" ? "Fresh in the oven" : "Order received"}</h2>
                </div>
                <div className="rounded-3xl bg-sand px-4 py-3 text-sm text-slate-700 border border-slate-200">
                  {order.status === "preparing" && countdownText ? (
                    <span className="font-semibold">{countdownText}</span>
                  ) : (
                    <span>{friendlyMessage}</span>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl bg-sand/70 p-5 border border-sand/80">
                  <div className="flex items-center gap-3 text-tide font-semibold">
                    <Clock3 size={18} />
                    <span>Estimated ready time</span>
                  </div>
                  <p className="mt-3 text-slate-700 text-sm">
                    {order.estimated_ready_at
                      ? new Date(order.estimated_ready_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Waiting for kitchen to start preparing."}
                  </p>
                </div>

                <div className="rounded-3xl bg-sand/70 p-5 border border-sand/80">
                  <div className="flex items-center gap-3 text-tide font-semibold">
                    <CircleDot size={18} />
                    <span>Current table</span>
                  </div>
                  <p className="mt-3 text-slate-700 text-sm">{order.table_number}</p>
                </div>
              </div>
            </div>

            <section className="rounded-[2rem] bg-tide text-cream p-6 shadow-sm border border-tide/40">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] font-semibold mb-4">
                <Sparkles className="w-5 h-5" /> Order summary
              </div>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.quantity}x {item.item_name}</p>
                      <p className="text-sm text-cream/80">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-cream/30 pt-5 text-right">
                <p className="text-sm text-cream/80">Total</p>
                <p className="text-3xl font-bold">${order.total_amount.toFixed(2)}</p>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
