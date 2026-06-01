import { NextRequest, NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/db';
import { transformWooProduct } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string | number | boolean> = { status: 'publish', per_page: 100 };
    
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    if (category) params.category = category;
    if (q) params.search = q;

    const wooProducts = await fetchProducts(params);
    const products = wooProducts.map(transformWooProduct);

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
