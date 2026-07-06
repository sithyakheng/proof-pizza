"use client";

import { useEffect, useState } from "react";
import { supabase, MenuCategory, MenuItem } from "@/lib/supabase";
import { Pizza } from "lucide-react";

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

export default function Menu() {
  const [categories, setCategories] = useState<MenuCategory[]>(FALLBACK_CATEGORIES);
  const [items, setItems] = useState<MenuItem[]>(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(FALLBACK_CATEGORIES[0].id);

  useEffect(() => {
    async function load() {
      try {
        const { data: menuItems, error: itemErr } = await supabase
          .from("menu_items")
          .select("*")
          .order("display_order");

        const { data: cats, error: catErr } = await supabase
          .from("menu_categories")
          .select("*")
          .order("display_order");

        const loadedItems = !itemErr && menuItems && menuItems.length > 0 ? (menuItems as MenuItem[]) : [];
        const loadedCategories = !catErr && cats && cats.length > 0 ? (cats as MenuCategory[]) : [];

        if (loadedItems.length > 0) {
          setItems(loadedItems);

          if (loadedCategories.length > 0) {
            const categoriesWithItems = loadedCategories.filter((cat) =>
              loadedItems.some((item) => item.category_id === cat.id)
            );

            if (categoriesWithItems.length > 0) {
              setCategories(categoriesWithItems);
              setActiveCategory(categoriesWithItems[0].id);
            } else {
              const derivedCategories = Array.from(
                new Map(
                  loadedItems.map((item) => [item.category_id, { id: item.category_id, name: item.category_id, display_order: 0 }])
                ).values()
              );
              setCategories(derivedCategories);
              setActiveCategory(derivedCategories[0].id);
            }
          } else {
            const derivedCategories = Array.from(
              new Map(
                loadedItems.map((item) => [item.category_id, { id: item.category_id, name: item.category_id, display_order: 0 }])
              ).values()
            );
            setCategories(derivedCategories);
            setActiveCategory(derivedCategories[0].id);
          }
        }
      } catch {
        // Supabase not configured yet — fallback data remains in state.
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleItems = items.filter((i) => i.category_id === activeCategory);
  const categoryTabs = categories.filter((cat) => items.some((item) => item.category_id === cat.id));
  const visibleTabs = categoryTabs.length > 0 ? categoryTabs : [{ id: activeCategory, name: activeCategory, display_order: 0 }];

  return (
    <section id="menu" className="bg-tide">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-ochre text-sm tracking-[0.2em] uppercase font-medium">
              Fresh from the oven
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-cream mt-4">
              The Menu
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm tracking-wide transition-colors ${
                  activeCategory === cat.id
                    ? "bg-ochre text-cream"
                    : "bg-cream/10 text-cream/70 hover:bg-cream/20"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-cream/50 text-sm">Loading menu…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="bg-cream/5 border border-cream/10 rounded-2xl overflow-hidden flex flex-col sm:flex-row gap-5 p-5"
              >
                {/* Fixed aspect ratio photo frame */}
                <div className="relative w-full sm:w-32 h-48 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-cream/10 flex items-center justify-center">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-cream/30 text-xs font-semibold select-none flex flex-col items-center gap-1.5">
                      <Pizza size={24} className="opacity-40" />
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                {/* Info and price */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-display text-lg text-cream font-medium">
                        {item.name}
                      </h3>
                      {!item.is_available && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-clay border border-clay/35 rounded-full px-2 py-0.5">
                          Sold out
                        </span>
                      )}
                    </div>
                    {item.description ? (
                      <p className="text-cream/55 text-sm mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-cream/55 text-sm mt-1.5 leading-relaxed">
                        Wood-fired, fresh mozzarella, basil
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="font-display text-ochre text-lg">
                      ${item.price.toFixed(2)}
                    </div>
                    <a
                      href="/order"
                      className="inline-flex items-center justify-center rounded-full bg-ochre px-5 py-3 text-sm font-semibold text-cream hover:bg-ochre/90 transition-colors"
                    >
                      Order
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {visibleItems.length === 0 && (
              <p className="text-cream/50 text-sm col-span-2 text-center py-8">
                No items in this category yet.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
