import { fetchProducts, fetchProduct, fetchCategories, WooProduct } from "./woocommerce";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: number;
  brand: string;
  gender: string;
  base_price: number;
  sale_price: number | null;
  discount_pct: number;
  images: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  stock_total: number;
  rating_avg: number;
  rating_count: number;
  categories: string[];
  colors: string[];
  sizes: string[];
  sku: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image_url: string | null;
  gender: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  count: number;
}

export function transformWooProduct(woo: WooProduct): Product {
  const base_price = parseFloat(woo.regular_price || woo.price || "0");
  const sale_price_raw = woo.sale_price ? parseFloat(woo.sale_price) : null;
  const sale_price = sale_price_raw !== null && sale_price_raw > 0 && sale_price_raw < base_price ? sale_price_raw : null;
  const discount_pct =
    sale_price && base_price > 0 ? Math.round(((base_price - sale_price) / base_price) * 100) : 0;

  const images = (woo.images || []).map((img) => img.src).filter(Boolean);

  const findAttr = (keywords: string[]) =>
    (woo.attributes || []).find((a) => keywords.some((k) => a.name?.toLowerCase().includes(k)));

  const colors = findAttr(["color", "colour"])?.options ?? [];
  const sizes = findAttr(["size"])?.options ?? [];
  const categories = (woo.categories || []).map((c) => c.name).filter(Boolean);
  const tags = (woo.tags || []).map((t) => t.name).filter(Boolean);

  return {
    id: String(woo.id),
    name: woo.name || "",
    slug: woo.slug || "",
    description: woo.description || "",
    short_description: woo.short_description || "",
    category_id: woo.categories?.[0]?.id ?? 0,
    brand: "The Style Zone",
    gender: "unisex",
    base_price,
    sale_price,
    discount_pct,
    images: images.length ? images : [`https://picsum.photos/seed/${woo.slug || woo.id}/600/800`],
    tags,
    is_active: woo.status === "publish",
    is_featured: woo.featured || false,
    stock_total: woo.stock_quantity ?? (woo.stock_status === "instock" ? 99 : 0),
    rating_avg: parseFloat(woo.average_rating || "0"),
    rating_count: woo.rating_count || 0,
    categories,
    colors,
    sizes,
    sku: woo.sku || "",
    created_at: woo.date_created || new Date().toISOString(),
    updated_at: woo.date_modified || new Date().toISOString(),
  };
}

export interface Db {
  products: Product[];
  categories: Category[];
}

export async function readDb(): Promise<Db> {
  const [wooProducts, wooCategories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const products = wooProducts.map(transformWooProduct);

  const categories: Category[] = wooCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parent || null,
    image_url: c.image?.src || null,
    gender: "unisex",
    sort_order: c.menu_order || 0,
    is_active: true,
    created_at: new Date().toISOString(),
    count: c.count || 0,
  }));

  return { products, categories };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const woo = await fetchProduct(slug);
  return woo ? transformWooProduct(woo) : null;
}

export type { WooProduct };
export { fetchProducts, fetchProduct, fetchCategories };
