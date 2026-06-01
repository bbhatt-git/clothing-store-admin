import { NextRequest, NextResponse } from 'next/server';

const WOO_URL = (process.env.WOOCOMMERCE_URL || '').replace(/\/$/, '');
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

function getAuth() {
  return Buffer.from(`${CK}:${CS}`).toString('base64');
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');
    if (!productId) return NextResponse.json({ error: 'product_id required' }, { status: 400 });

    const res = await fetch(
      `${WOO_URL}/wp-json/wc/v3/products/reviews?product=${productId}&status=approved&per_page=50`,
      { headers: { Authorization: `Basic ${getAuth()}` } }
    );
    const reviews = res.ok ? await res.json() : [];
    return NextResponse.json({ success: true, reviews });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { product_id, review, reviewer, reviewer_email, rating } = await req.json();
    if (!product_id || !review || !reviewer || !reviewer_email || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const res = await fetch(`${WOO_URL}/wp-json/wc/v3/products/reviews`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id, review, reviewer, reviewer_email, rating, status: 'approved' }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: errText.slice(0, 200) }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
