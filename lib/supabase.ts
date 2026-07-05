import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Falls back to a placeholder so the site still builds/runs before env vars
// are set. Real reads/writes will simply fail gracefully until you add your
// actual Supabase URL and anon key to .env.local.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MenuCategory = {
  id: string;
  name: string;
  display_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
};

export type GalleryItem = {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  display_order: number;
};
