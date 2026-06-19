import { NextRequest, NextResponse } from 'next/server';

const WOO_URL = (process.env.WOOCOMMERCE_URL || '').replace(/\/$/, '');
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

function getAuth() {
  return Buffer.from(`${CK}:${CS}`).toString('base64');
}

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const res = await fetch(`${WOO_URL}/wp-json/wc/v3/orders/${id}`, {
      headers: {
        Authorization: `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const woo = await res.json();

    const billing = woo.billing || {};
    const shipping = woo.shipping || {};
    const fullName = [billing.first_name, billing.last_name].filter(Boolean).join(' ');

    type MetaEntry = { key: string; value: string };
    const meta = (woo.meta_data || []) as MetaEntry[];
    const getMeta = (key: string) => meta.find((m) => m.key === key)?.value || '';

    const municipality =
      getMeta('municipality') ||
      getMeta('_municipality') ||
      shipping.city ||
      billing.city ||
      '';
    const wardNo =
      getMeta('ward_no') ||
      getMeta('_ward_no') ||
      getMeta('wardNo') ||
      '';

    type WooLineItem = {
      id: number;
      product_id: number;
      variation_id: number;
      name: string;
      quantity: number;
      price: string;
      total: string;
      image?: { src: string };
      meta_data?: Array<{ key: string; display_key: string; display_value: string }>;
    };

    const lineItems = (woo.line_items || []).map((item: WooLineItem) => {
      const itemMeta = item.meta_data || [];
      const size =
        itemMeta.find((m) => m.display_key?.toLowerCase().includes('size'))
          ?.display_value || '';
      const color =
        itemMeta.find(
          (m) =>
            m.display_key?.toLowerCase().includes('color') ||
            m.display_key?.toLowerCase().includes('colour')
        )?.display_value || '';
      return {
        id: String(item.id),
        order_id: String(woo.id),
        product_id: String(item.product_id),
        variant_id: String(item.variation_id || ''),
        name: item.name,
        image_url: item.image?.src || '',
        size,
        color,
        quantity: item.quantity,
        unit_price: parseFloat(item.price) || 0,
        total_price: parseFloat(item.total) || 0,
      };
    });

    const subtotal = lineItems.reduce(
      (s: number, i: { total_price: number }) => s + i.total_price,
      0
    );

    const order = {
      id: String(woo.id),
      order_number: `#${woo.number}`,
      customer_name: fullName,
      customer_phone: billing.phone || '',
      customer_email: billing.email || null,
      shipping_address: shipping.address_1 || billing.address_1 || '',
      municipality,
      wardNo,
      payment_method: woo.payment_method || 'cod',
      payment_status: ['completed', 'processing'].includes(woo.status)
        ? 'paid'
        : 'pending',
      payment_txn_id:
        getMeta('transaction_id') ||
        getMeta('_transaction_id') ||
        woo.transaction_id ||
        null,
      subtotal,
      discount_amount: parseFloat(woo.discount_total || '0'),
      shipping_fee: parseFloat(woo.shipping_total || '0'),
      total: parseFloat(woo.total || '0'),
      coupon_code:
        woo.coupon_lines?.length > 0 ? woo.coupon_lines[0].code : null,
      notes: woo.customer_note || null,
      created_at: woo.date_created || new Date().toISOString(),
      status: woo.status,
      items: lineItems,
    };

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
