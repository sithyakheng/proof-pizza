"use client";

import { useEffect, useState } from "react";
import { supabase, MenuCategory, MenuItem } from "@/lib/supabase";
import { Pizza } from "lucide-react";

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
    image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=60",
    is_available: true,
    display_order: 1,
  },
  {
    id: "2",
    category_id: "c1",
    name: "Margherita",
    description: "San Marzano tomato, fior di latte, basil",
    price: 6.5,
    image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=60",
    is_available: true,
    display_order: 2,
  },
  {
    id: "3",
    category_id: "c1",
    name: "Kep Pepper Prawn",
    description: "Local Kep prawns, Kampot pepper, garlic oil",
    price: 9,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=60",
    is_available: true,
    display_order: 3,
  },
  {
    id: "4",
    category_id: "c2",
    name: "Garlic Focaccia",
    description: "Baked to order, herb butter",
    price: 3.5,
    image_url: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=60",
    is_available: true,
    display_order: 1,
  },
  {
    id: "5",
    category_id: "c3",
    name: "Iced Pour-Over",
    description: "Rotating single origin",
    price: 3,
    image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=60",
    is_available: true,
    display_order: 1,
  },
  {
    id: "6",
    category_id: "c3",
    name: "Fresh Lime Soda",
    description: "Kep lime, soda, mint",
    price: 2.5,
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60",
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
                    {item.description && (
                      <p className="text-cream/55 text-sm mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="font-display text-ochre text-lg mt-3 sm:mt-0">
                    ${item.price.toFixed(2)}
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
