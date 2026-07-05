"use client";

import { useEffect, useState } from "react";
import { supabase, MenuCategory, MenuItem } from "@/lib/supabase";

const FALLBACK_CATEGORIES: MenuCategory[] = [
  { id: "c1", name: "Pizza", display_order: 1 },
  { id: "c2", name: "Sides", display_order: 2 },
  { id: "c3", name: "Coffee & Drinks", display_order: 3 },
];

const FALLBACK_ITEMS: MenuItem[] = [
  {
    id: "1",
    category_id: "c1",
    name: "Prosciutto & Arugula",
    description: "San Daniele prosciutto, fresh arugula, shaved parmesan",
    price: 8.5,
    image_url: null,
    is_available: true,
    display_order: 1,
  },
  {
    id: "2",
    category_id: "c1",
    name: "Margherita",
    description: "San Marzano tomato, fior di latte, basil",
    price: 6.5,
    image_url: null,
    is_available: true,
    display_order: 2,
  },
  {
    id: "3",
    category_id: "c1",
    name: "Kep Pepper Prawn",
    description: "Local Kep prawns, Kampot pepper, garlic oil",
    price: 9,
    image_url: null,
    is_available: true,
    display_order: 3,
  },
  {
    id: "4",
    category_id: "c2",
    name: "Garlic Focaccia",
    description: "Baked to order, herb butter",
    price: 3.5,
    image_url: null,
    is_available: true,
    display_order: 1,
  },
  {
    id: "5",
    category_id: "c3",
    name: "Iced Pour-Over",
    description: "Rotating single origin",
    price: 3,
    image_url: null,
    is_available: true,
    display_order: 1,
  },
  {
    id: "6",
    category_id: "c3",
    name: "Fresh Lime Soda",
    description: "Kep lime, soda, mint",
    price: 2.5,
    image_url: null,
    is_available: true,
    display_order: 2,
  },
];

export default function Menu() {
  const [categories, setCategories] = useState<MenuCategory[]>(FALLBACK_CATEGORIES);
  const [items, setItems] = useState<MenuItem[]>(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("c1");

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
        // Supabase not configured yet — fallback data already in state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleItems = items.filter((i) => i.category_id === activeCategory);

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
            {categories.map((cat) => (
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
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 border-b border-cream/10 pb-6"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg text-cream">
                      {item.name}
                    </h3>
                    {!item.is_available && (
                      <span className="text-xs uppercase tracking-wide text-clay border border-clay/50 rounded-full px-2 py-0.5">
                        Sold out
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-cream/55 text-sm mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="font-display text-ochre text-lg whitespace-nowrap">
                  ${item.price.toFixed(2)}
                </div>
              </div>
            ))}
            {visibleItems.length === 0 && (
              <p className="text-cream/50 text-sm">No items in this category yet.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
