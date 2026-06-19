import { NextRequest, NextResponse } from 'next/server';

const WOO_URL = (process.env.WOOCOMMERCE_URL || '').replace(/\/$/, '');
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 });

    const auth = Buffer.from(`${CK}:${CS}`).toString('base64');
    const res = await fetch(`${WOO_URL}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code)}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) return NextResponse.json({ success: false, error: 'Failed to validate coupon' }, { status: 500 });

    const coupons = await res.json();
    const coupon = coupons[0];

    if (!coupon) return NextResponse.json({ success: false, error: 'Invalid coupon code' });
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      return NextResponse.json({ success: false, error: 'This coupon has expired' });
    }
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ success: false, error: 'Coupon usage limit reached' });
    }
    if (coupon.minimum_amount && parseFloat(coupon.minimum_amount) > subtotal) {
      return NextResponse.json({ success: false, error: `Minimum order of Rs ${coupon.minimum_amount} required` });
    }

    const discountValue = parseFloat(coupon.amount || '0');
    const discountAmount = coupon.discount_type === 'percent'
      ? Math.round((subtotal * discountValue) / 100)
      : discountValue;

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: discountValue,
      discountAmount: Math.min(discountAmount, subtotal),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
