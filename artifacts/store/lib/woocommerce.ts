const WOO_URL = (process.env.WOOCOMMERCE_URL || "").replace(/\/$/, "");
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  average_rating: string;
  rating_count: number;
  images: { id: number; src: string; alt: string }[];
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  attributes: { id: number; name: string; options: string[]; variation: boolean; visible: boolean }[];
  variations: number[];
  date_created: string;
  date_modified: string;
}

export interface WooVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  status: string;
  stock_status: string;
  stock_quantity: number | null;
  attributes: { id: number; name: string; option: string }[];
  image: { id: number; src: string } | null;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  image: { src: string } | null;
  menu_order: number;
  count: number;
}

async function wooFetch(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<unknown> {
  if (!WOO_URL || !CK || !CS) {
    throw new Error("WooCommerce credentials not configured");
  }
  const url = new URL(`${WOO_URL}/wp-json/wc/v3/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const auth = Buffer.from(`${CK}:${CS}`).toString("base64");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Basic ${auth}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function fetchProducts(params: Record<string, string | number | boolean> = {}): Promise<WooProduct[]> {
  const result = await wooFetch("products", { status: "publish", per_page: 100, ...params });
  return result as WooProduct[];
}

export async function fetchProduct(slug: string): Promise<WooProduct | null> {
  const result = await wooFetch("products", { slug, status: "publish" });
  const arr = result as WooProduct[];
  return arr[0] ?? null;
}

export async function fetchVariations(productId: number): Promise<WooVariation[]> {
  try {
    const result = await wooFetch(`products/${productId}/variations`, { per_page: 100 });
    return result as WooVariation[];
  } catch {
    return [];
  }
}

export async function fetchCategories(): Promise<WooCategory[]> {
  const result = await wooFetch("products/categories", { per_page: 100, hide_empty: false });
  return result as WooCategory[];
}
