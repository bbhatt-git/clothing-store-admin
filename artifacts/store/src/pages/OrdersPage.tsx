import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';
import { ClipboardList, ChevronRight, Calendar, Clock, Package, ShoppingBag } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface OrderItem {
  id: string; order_id: string; product_id: string; variant_id: string;
  name: string; image_url: string; size: string; color: string;
  quantity: number; unit_price: number; total_price: number;
}

interface Order {
  id: string; order_number: string; status: string; payment_method: string;
  payment_status: string; payment_txn_id?: string | null; subtotal: number;
  discount_amount: number; shipping_fee: number; total: number;
  customer_name: string; customer_phone: string; customer_email: string | null;
  shipping_address: string; municipality: string; wardNo: string;
  created_at: string; items: OrderItem[];
}

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    shipped: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  const cls = map[status] || 'bg-zinc-50 text-zinc-700 border-zinc-200';
  return <span className={`${cls} border text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide capitalize`}>{status}</span>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const guestOrders = localStorage.getItem('sz_guest_orders');
        if (guestOrders) {
          const orderIds = JSON.parse(guestOrders);
          if (Array.isArray(orderIds) && orderIds.length > 0) {
            const results = await Promise.all(orderIds.map(id => fetch(`${BASE}/api/orders/${id}`).then(r => r.json())));
            setOrders(results.filter(r => r.success && r.order).map(r => r.order));
          }
        }
      } catch (e) {
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-grow space-y-6">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <Link href="/" className="hover:text-[#FE5733]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-500 font-bold">Guest Order Center</span>
        </div>

        <div className="space-y-1 max-w-lg">
          <h1 className="text-xl md:text-3xl font-black text-[#121212] tracking-tight">Guest Order Center</h1>
          <p className="text-xs text-stone-400 font-medium">Track your boutique shipments and orders securely from Mahendranagar.</p>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-xs text-stone-400">
            <Clock className="w-8 h-8 text-[#FE5733] animate-spin mb-1.5" />
            <span>Checking order history status...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-150 p-6 rounded-[4px] max-w-xl mx-auto text-center space-y-3">
            <ClipboardList className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs text-red-700 font-bold">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-[4px] p-16 text-center shadow-sm max-w-xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-stone-50 border border-stone-200 text-stone-400 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#121212] mb-2">No Orders Found</h3>
            <p className="text-xs text-stone-400 mb-8 max-w-sm">No orders have been placed from this device yet. Start shopping to create your first order.</p>
            <Link href="/shop" className="bg-[#FE5733] text-white px-8 py-3 rounded-sm font-bold uppercase text-xs tracking-widest hover:bg-[#e04825] transition-colors flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-stone-200 rounded-[4px] p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-black text-[#121212]">Order #{order.order_number}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(order.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{order.payment_method.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#FE5733]">Rs {order.total.toLocaleString()}</p>
                    <p className="text-xs text-stone-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="border-t border-stone-100 pt-4">
                  <div className="flex flex-wrap gap-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-stone-50 rounded-[4px] p-2 border border-stone-100">
                        <img src={item.image_url} alt={item.name} className="w-10 h-12 object-cover rounded bg-white border border-stone-100" />
                        <div className="text-xs">
                          <p className="font-bold text-[#121212] line-clamp-1">{item.name}</p>
                          <p className="text-stone-400">x{item.quantity} • {item.size} • {item.color}</p>
                          <p className="font-bold text-[#FE5733]">Rs {item.total_price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-stone-100 pt-4 mt-4 text-xs text-stone-500">
                  <p><strong>Shipping to:</strong> {order.shipping_address}, Ward {order.wardNo}, {order.municipality}</p>
                  <p className="mt-1"><strong>Customer:</strong> {order.customer_name} • {order.customer_phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
