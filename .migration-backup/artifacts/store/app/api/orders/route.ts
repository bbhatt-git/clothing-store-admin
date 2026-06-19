import { NextRequest, NextResponse } from 'next/server';

const WOO_URL = (process.env.WOOCOMMERCE_URL || '').replace(/\/$/, '');
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

function getAuth() {
  return Buffer.from(`${CK}:${CS}`).toString('base64');
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      customerName, customerPhone, customerEmail,
      shippingAddress, items, paymentMethod,
    } = data;

    if (!customerName || !customerPhone || !shippingAddress || !items?.length) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const lineItems = items.map((item: { product_id: number; quantity: number; variation_id?: number }) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      ...(item.variation_id ? { variation_id: item.variation_id } : {}),
    }));

    const orderData = {
      status: 'pending',
      payment_method: paymentMethod || 'cod',
      payment_method_title: paymentMethod === 'esewa' ? 'eSewa' : paymentMethod === 'khalti' ? 'Khalti' : 'Cash on Delivery',
      billing: {
        first_name: customerName.split(' ')[0] || customerName,
        last_name: customerName.split(' ').slice(1).join(' ') || '',
        phone: customerPhone,
        email: customerEmail || '',
        address_1: shippingAddress,
        country: 'NP',
      },
      shipping: {
        first_name: customerName.split(' ')[0] || customerName,
        last_name: customerName.split(' ').slice(1).join(' ') || '',
        address_1: shippingAddress,
        country: 'NP',
      },
      line_items: lineItems,
    };

    const res = await fetch(`${WOO_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: `WooCommerce error: ${errText.slice(0, 200)}` }, { status: 500 });
    }

    const order = await res.json();
    return NextResponse.json({ success: true, order_id: order.id, order_number: order.number });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
