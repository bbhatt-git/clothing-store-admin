import { NextResponse } from 'next/server';
import { fetchCategories } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wooCategories = await fetchCategories();
    const categories = wooCategories
      .filter(c => c.count > 0 || c.name !== 'Uncategorized')
      .map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parent_id: c.parent || null,
        image_url: c.image?.src || null,
        sort_order: c.menu_order || 0,
        is_active: true,
        count: c.count,
      }));
    return NextResponse.json({ success: true, categories });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
