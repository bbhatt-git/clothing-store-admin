import { fetchProducts, fetchProduct, fetchCategories, fetchVariations, WooProduct, WooVariation } from "./woocommerce";

export interface Variation {
  id: string;
  sku: string;
  price: number;
  regular_price: number;
  sale_price: number | null;
  stock: number;
  in_stock: boolean;
  attributes: { name: string; option: string }[];
  image: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: number;
  brand: string;
  gender: string;
  type: string;
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
  variations: Variation[];
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

export function transformWooProduct(woo: WooProduct, wooVariations: WooVariation[] = []): Product {
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

  const variations: Variation[] = wooVariations.map((v) => {
    const vRegular = parseFloat(v.regular_price || v.price || "0");
    const vSaleRaw = v.sale_price ? parseFloat(v.sale_price) : null;
    const vSale = vSaleRaw !== null && vSaleRaw > 0 && vSaleRaw < vRegular ? vSaleRaw : null;
    const vStock = v.stock_quantity ?? (v.stock_status === "instock" ? 99 : 0);
    return {
      id: String(v.id),
      sku: v.sku || "",
      price: parseFloat(v.price || "0"),
      regular_price: vRegular,
      sale_price: vSale,
      stock: vStock,
      in_stock: v.stock_status === "instock" || (v.stock_quantity !== null && v.stock_quantity > 0),
      attributes: (v.attributes || []).map((a) => ({ name: a.name, option: a.option })),
      image: v.image?.src || null,
    };
  });

  return {
    id: String(woo.id),
    name: woo.name || "",
    slug: woo.slug || "",
    type: woo.type || "simple",
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
    variations,
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

  const products = wooProducts.map((p) => transformWooProduct(p, []));

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
  if (!woo) return null;

  let wooVariations: WooVariation[] = [];
  if (woo.type === "variable" && Array.isArray(woo.variations) && woo.variations.length > 0) {
    wooVariations = await fetchVariations(woo.id);
  }

  return transformWooProduct(woo, wooVariations);
}

export type { WooProduct };
export { fetchProducts, fetchProduct, fetchCategories };
