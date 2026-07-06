"use client";

import { useEffect, useState } from "react";
import { supabase, MenuCategory, MenuItem } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, Minus, ShoppingBag, CheckCircle } from "lucide-react";

const FALLBACK_CATEGORIES: MenuCategory[] = [{ id: "pizza", name: "Pizza", display_order: 1 }];

const FALLBACK_ITEMS: MenuItem[] = [
  {
    id: "pizza-1",
    category_id: "pizza",
    name: "Italian Pizza",
    description: "Wood-fired, fresh mozzarella, basil",
    price: 8.0,
    image_url:
      "https://cfxgfthinkorqgmqmahp.supabase.co/storage/v1/object/public/menu-images/ChatGPT%20Image%20Jul%206,%202026,%2002_49_25%20PM.png",
    is_available: true,
    display_order: 1,
  },
];

export default function OrderPage() {
  const [categories, setCategories] = useState<MenuCategory[]>(FALLBACK_CATEGORIES);
  const [items, setItems] = useState<MenuItem[]>(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(FALLBACK_CATEGORIES[0].id);

  // Cart state: item_id -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  
  // Checkout details
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  
  // Order status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    items: Array<{ item: MenuItem; qty: number }>;
    total: number;
    tableNumber: string;
    customerName: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: cats, error: catErr } = await supabase
          .from("menu_categories")
          .select("*")
          .order("display_order");

        const { data: menuItems, error: itemErr } = await supabase
          .from("menu_items")
          .select("*")
          .order("display_order");

        if (!catErr && cats && cats.length > 0) {
          setCategories(cats as MenuCategory[]);
          setActiveCategory((cats[0] as MenuCategory).id);
        }
        if (!itemErr && menuItems && menuItems.length > 0) {
          setItems(menuItems as MenuItem[]);
        }
      } catch {
        // Fallback to offline data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const getCartItemsList = () => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const item = items.find((i) => i.id === id);
        return item ? { item, qty } : null;
      })
      .filter((entry): entry is { item: MenuItem; qty: number } => entry !== null);
  };

  const cartItems = getCartItemsList();
  const totalAmount = cartItems.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setErrorMessage("Please select at least one item to order.");
      return;
    }
    if (!customerName.trim() || !tableNumber.trim()) {
      setErrorMessage("Please fill in both Customer Name and Table Number.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Insert order
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: customerName.trim(),
          table_number: tableNumber.trim(),
          total_amount: totalAmount,
          status: "pending",
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      console.log("[order] inserted order row:", orderData);
      const orderId = orderData.id;
      console.log("[order] created order id:", orderId);

      // 2. Insert order items
      const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

      const itemsToInsert = cartItems.map((entry) => ({
        order_id: orderId,
        menu_item_id: isUUID(entry.item.id) ? entry.item.id : null,
        item_name: entry.item.name,
        price: entry.item.price,
        quantity: entry.qty,
      }));

      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      console.log("[order] insert order_items result:", { itemsErr, itemsToInsertCount: itemsToInsert.length });
      if (itemsErr) throw itemsErr;

      setCart({});
      setCustomerName("");
      setTableNumber("");
      setConfirmation({
        items: cartItems,
        total: totalAmount,
        tableNumber: tableNumber.trim(),
        customerName: customerName.trim(),
      });
    } catch (err: any) {
      console.error("Order error:", err);
      setErrorMessage(
        err?.message
          ? `Failed to submit order: ${err.message}`
          : "Failed to submit order. Please try again or ask a staff member."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const visibleCategories = categories.filter((cat) => items.some((item) => item.category_id === cat.id));
  const activeTabs = visibleCategories.length > 0 ? visibleCategories : [{ id: activeCategory, name: activeCategory, display_order: 0 }];
  const visibleItems = items.filter((i) => i.category_id === activeCategory);

  if (confirmation) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-sand pt-28 pb-16">
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <section className="bg-cream border border-tide/10 rounded-[2rem] p-8 md:p-10 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-tide/10 text-tide">
                  <CheckCircle size={32} />
                </div>
                <h1 className="font-display text-4xl text-tide">Thank you for your order!</h1>
                <p className="mt-4 text-charcoal/75 text-base md:text-lg">
                  Your order has been sent to the kitchen. Enjoy your meal!
                </p>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-[2rem] bg-sand border border-tide/10 p-6">
                  <h2 className="text-xl font-semibold text-tide">Order Summary</h2>
                  <div className="mt-5 space-y-4">
                    {confirmation.items.map(({ item, qty }) => (
                      <div key={item.id} className="flex justify-between gap-4 text-sm">
                        <p className="font-semibold text-charcoal">{qty}x {item.name}</p>
                        <p className="font-semibold text-ochre">${(item.price * qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-charcoal/10 pt-5 flex items-center justify-between text-base font-semibold text-charcoal">
                    <span>Total</span>
                    <span>${confirmation.total.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 text-sm text-charcoal/75">
                    <p>
                      <span className="font-semibold">Table:</span> {confirmation.tableNumber}
                    </p>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-tide text-cream p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Order Details</h2>
                    <div className="mt-5 space-y-4 text-sm text-cream/95">
                      <div>
                        <p className="text-xxs uppercase tracking-[0.25em] text-cream/70">Customer</p>
                        <p className="mt-2 font-semibold">{confirmation.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xxs uppercase tracking-[0.25em] text-cream/70">Table</p>
                        <p className="mt-2 font-semibold">{confirmation.tableNumber}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmation(null)}
                    className="mt-8 w-full rounded-full bg-cream text-tide font-semibold py-3 transition hover:bg-cream/90"
                  >
                    Place another order
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-sand pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
              {/* Header */}
              <div className="mb-10 text-center md:text-left">
                <span className="text-ochre text-sm tracking-[0.2em] uppercase font-medium">
                  Fresh from our wood-fired oven
                </span>
                <h1 className="font-display text-4xl md:text-5xl text-tide mt-3">
                  Place Your Order
                </h1>
                <p className="text-charcoal/60 mt-2 text-sm md:text-base">
                  Select your items, enter details, and we'll bring them straight to your table.
                </p>
              </div>

              {/* Grid Layout */}
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: Menu items */}
                <div className="lg:col-span-7 bg-cream border border-tide/5 rounded-3xl p-6 md:p-8 shadow-sm">
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2 mb-8 border-b border-charcoal/5 pb-6">
                    {activeTabs.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-colors ${
                          activeCategory === cat.id
                            ? "bg-ochre text-cream"
                            : "bg-charcoal/5 text-charcoal/75 hover:bg-charcoal/10"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className="text-charcoal/50 text-sm py-12 text-center">Loading fresh menu…</div>
                  ) : (
                    <div className="space-y-6">
                      {visibleItems.map((item) => {
                        const qty = cart[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-charcoal/5 pb-6 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start gap-4 w-full md:w-auto">
                              <div className="w-full md:w-32 h-32 rounded-3xl overflow-hidden bg-sand/80 flex items-center justify-center shrink-0">
                                {item.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-charcoal/30 text-xs font-semibold text-center px-3">
                                    No photo available
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-display text-lg text-tide font-semibold">
                                    {item.name}
                                  </h3>
                                  {!item.is_available && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-clay border border-clay/35 rounded-full px-2 py-0.5">
                                      Sold out
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-charcoal/60 text-xs md:text-sm mt-1 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                                <div className="text-ochre font-medium text-sm md:text-base mt-3">
                                  ${item.price.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              {item.is_available ? (
                                qty > 0 ? (
                                  <div className="flex items-center bg-sand border border-charcoal/10 rounded-full p-1 gap-2.5">
                                    <button
                                      onClick={() => updateQuantity(item.id, -1)}
                                      className="p-1 rounded-full text-tide hover:bg-charcoal/5 transition-colors"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <span className="font-semibold text-tide text-sm w-4 text-center">
                                      {qty}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, 1)}
                                      className="p-1 rounded-full text-tide hover:bg-charcoal/5 transition-colors"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="bg-tide text-cream text-xs font-semibold px-4 py-2 rounded-full hover:bg-tide-light transition-colors flex items-center gap-1 shadow-sm"
                                  >
                                    <Plus size={14} /> Add
                                  </button>
                                )
                              ) : (
                                <span className="text-xs text-charcoal/30 font-medium">Unavailable</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {visibleItems.length === 0 && (
                        <p className="text-charcoal/40 text-center py-8">No items in this category.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side: Basket & Checkout */}
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                  <div className="bg-cream border border-tide/5 rounded-3xl p-6 md:p-8 shadow-sm">
                    <h2 className="font-display text-2xl text-tide border-b border-charcoal/5 pb-4 mb-5 flex items-center gap-2">
                      <ShoppingBag size={20} className="text-ochre" /> Your Order
                    </h2>

                    {cartItems.length === 0 ? (
                      <div className="text-center py-8 text-charcoal/40 text-sm">
                        Your tray is empty. Add items from the menu.
                      </div>
                    ) : (
                      <>
                        {/* Cart items list */}
                        <div className="space-y-4 max-h-[220px] overflow-y-auto mb-6 pr-1">
                          {cartItems.map(({ item, qty }) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex-1 min-w-0 pr-2">
                                <span className="font-semibold text-tide">{qty}x</span>{" "}
                                <span className="text-charcoal/80 truncate inline-block max-w-[80%] align-bottom">
                                  {item.name}
                                </span>
                              </div>
                              <div className="font-medium text-charcoal pr-3">
                                ${(item.price * qty).toFixed(2)}
                              </div>
                              <button
                                onClick={() => updateQuantity(item.id, -qty)}
                                className="text-xs text-clay hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary Total */}
                        <div className="border-t border-charcoal/5 pt-4 mb-6 flex justify-between items-center">
                          <span className="font-medium text-charcoal">Total Amount</span>
                          <span className="font-display text-2xl text-ochre font-bold">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </div>

                        {/* Checkout Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="customerName" className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1.5">
                              Name
                            </label>
                            <input
                              type="text"
                              id="customerName"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="e.g. Liam"
                              className="w-full bg-sand/40 border border-charcoal/10 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-ochre focus:ring-1 focus:ring-ochre"
                            />
                          </div>

                          <div>
                            <label htmlFor="tableNumber" className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1.5">
                              Table Number
                            </label>
                            <input
                              type="text"
                              id="tableNumber"
                              required
                              value={tableNumber}
                              onChange={(e) => setTableNumber(e.target.value)}
                              placeholder="e.g. Table 4"
                              className="w-full bg-sand/40 border border-charcoal/10 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-ochre focus:ring-1 focus:ring-ochre"
                            />
                          </div>

                          {errorMessage && (
                            <div className="text-xs text-clay bg-clay/10 p-3 rounded-lg border border-clay/20 font-medium">
                              {errorMessage}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full text-center py-3.5 rounded-full font-medium tracking-wide text-cream transition-colors text-sm shadow-sm ${
                              submitting
                                ? "bg-tide/50 cursor-not-allowed"
                                : "bg-ochre hover:bg-ochre/90"
                            }`}
                          >
                            {submitting ? "Sending to Kitchen..." : "Confirm & Send to Kitchen"}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>

              </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
