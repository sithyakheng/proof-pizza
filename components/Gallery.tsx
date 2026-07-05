"use client";

import { useEffect, useState } from "react";
import { supabase, GalleryItem } from "@/lib/supabase";
import { X } from "lucide-react";

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("display_order");
        if (!error && data) setItems(data as GalleryItem[]);
      } catch {
        // no supabase connection yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section id="gallery" className="bg-sand">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <span className="text-ochre text-sm tracking-[0.2em] uppercase font-medium">
          A look inside
        </span>
        <h2 className="font-display text-3xl md:text-4xl mt-4 mb-12">Gallery</h2>

        {loading && <div className="text-charcoal/50 text-sm">Loading photos…</div>}

        {!loading && items.length === 0 && (
          <div className="border border-dashed border-charcoal/20 rounded-2xl p-12 text-center text-charcoal/50">
            Photos and videos added in Supabase will appear here automatically.
          </div>
        )}

        {items.length > 0 && (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item)}
                className="block w-full break-inside-avoid rounded-xl overflow-hidden border border-charcoal/10 hover:opacity-90 transition-opacity"
              >
                {item.media_type === "video" ? (
                  <video src={item.media_url} className="w-full h-auto" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.media_url} alt={item.caption || "Proof Pizza"} className="w-full h-auto" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-charcoal/90 z-[100] flex items-center justify-center p-6"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute top-6 right-6 text-cream"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          {active.media_type === "video" ? (
            <video src={active.media_url} className="max-h-[85vh] max-w-full rounded-lg" controls autoPlay />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={active.media_url} alt={active.caption || ""} className="max-h-[85vh] max-w-full rounded-lg" />
          )}
        </div>
      )}
    </section>
  );
}
