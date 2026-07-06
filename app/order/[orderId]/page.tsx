"use client";

import { useEffect, useState } from "react";
import { supabase, OrderItem } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";

type OrderStatusPageProps = {
  params: {
    orderId: string;
  };
};

type OrderDetails = {
  id: string;
  customer_name: string;
  table_number: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
};

export default function OrderStatusPage({ params }: OrderStatusPageProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`id, customer_name, table_number, total_amount, created_at, order_items(id, item_name, price, quantity)`)
          .eq("id", params.orderId)
          .single();

        if (error) throw error;
        setOrder(data as OrderDetails);
      } catch (err: any) {
        console.error("Error loading order details:", err);
        setError(err?.message || "Unable to load your order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand pt-28 pb-16">
        <Navbar />
        <div className="max-w-5xl mx-auto px-5 md:px-8 text-center py-24">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-white/90 border border-slate-200 px-8 py-6 shadow-sm">
            <Sparkles className="text-ochre w-8 h-8" />
            <div>
              <p className="text-slate-700 font-semibold">Loading your order confirmation...</p>
              <p className="text-slate-500 text-sm">Please wait while we retrieve your order details.</p>
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
            <p className="text-rose-600 font-semibold">Unable to load your order.</p>
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
          <div className="text-center mb-10">
            <p className="text-2xl font-semibold text-tide">Thank you for your order!</p>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              We’ve received your request and will bring it to table {order.table_number} shortly.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Order Summary</h2>
              <div className="mt-6 space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.quantity}x {item.item_name}</p>
                    </div>
                    <p className="text-slate-600">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5 flex items-center justify-between text-sm font-semibold text-slate-900">
                <span>Total</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-[2rem] bg-tide text-cream p-6 shadow-sm border border-tide/40">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <div className="mt-5 space-y-4 text-sm text-cream/90">
                <div>
                  <p className="text-xxs uppercase tracking-[0.25em] text-cream/70">Customer</p>
                  <p className="mt-2 font-semibold text-white">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xxs uppercase tracking-[0.25em] text-cream/70">Table</p>
                  <p className="mt-2 font-semibold text-white">{order.table_number}</p>
                </div>
                <div>
                  <p className="text-xxs uppercase tracking-[0.25em] text-cream/70">Order ID</p>
                  <p className="mt-2 font-semibold text-white break-all">{order.id}</p>
                </div>
                <div>
                  <p className="text-xxs uppercase tracking-[0.25em] text-cream/70">Order placed</p>
                  <p className="mt-2 font-semibold text-white">{new Date(order.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
