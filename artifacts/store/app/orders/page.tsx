'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ClipboardList, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Package,
  ShoppingBag
} from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  name: string;
  image_url: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_txn_id?: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  municipality: string;
  wardNo: string;
  created_at: string;
  items: OrderItem[];
}

export default function GuestOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Get order IDs from localStorage
        if (typeof window !== 'undefined') {
          const guestOrders = localStorage.getItem('sz_guest_orders');
          if (guestOrders) {
            try {
              const orderIds = JSON.parse(guestOrders);
              if (Array.isArray(orderIds) && orderIds.length > 0) {
                // Fetch each order from API
                const orderPromises = orderIds.map(id => 
                  fetch(`/api/orders/${id}`).then(res => res.json())
                );
                
                const results = await Promise.all(orderPromises);
                const successfulOrders = results
                  .filter(result => result.success && result.order)
                  .map(result => result.order);
                
                setOrders(successfulOrders);
              }
            } catch (e) {
              console.error('Failed to parse guest orders:', e);
              setError('Failed to load order history.');
            }
          }
        }
      } catch (err) {
        setError('Network error syncing with order backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Helper status color badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-250 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">Pending</span>;
      case 'processing':
        return <span className="bg-blue-50 text-blue-700 border border-blue-250 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">Processing</span>;
      case 'completed':
      case 'confirmed':
        return <span className="bg-green-50 text-green-700 border border-green-250 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">Confirmed</span>;
      case 'shipped':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">Shipped</span>;
      case 'cancelled':
        return <span className="bg-red-50 text-red-700 border border-red-250 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">Cancelled</span>;
      case 'refunded':
        return <span className="bg-orange-50 text-orange-700 border border-orange-250 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">Refunded</span>;
      default:
        return <span className="bg-zinc-50 text-zinc-700 border border-zinc-250 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-grow space-y-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <Link href="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-500 font-bold">Guest Order Center</span>
        </div>

        <div className="space-y-1 max-w-lg">
          <h1 className="text-xl md:text-3xl font-black text-[#121212] tracking-tight font-sans">Guest Order Center</h1>
          <p className="text-xs text-stone-400 font-medium">Track your boutique shipments and pending payments verification queue securely from Mahendranagar.</p>
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
          <div className="bg-white border border-stone-200 rounded-[4px] p-16 text-center space-y-4 shadow-sm max-w-xl mx-auto py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-stone-50 border border-stone-200 text-stone-400 rounded-full flex items-center justify-center">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#121212]">No Orders Found</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-xs leading-relaxed">You haven&apos;t placed any guest orders on this device yet. Start shopping to see your orders here.</p>
            </div>
            <div>
              <Link href="/shop" className="bg-[#121212] text-white rounded-[4px] text-xs font-bold px-6 py-2.5 inline-block">
                Start Browsing Fashion
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-stone-400 px-1">Your Orders ({orders.length})</h3>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-stone-200 rounded-[4px] p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FE5733] text-white rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#121212]">{order.order_number}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(order.status)}
                          <span className="text-xs text-stone-400">• Rs {(order.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <p className="text-xs text-stone-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <Link 
                        href={`/checkout/success?order_id=${order.id}`}
                        className="bg-[#121212] hover:bg-[#FE5733] text-white rounded-[4px] text-xs font-bold px-4 py-2 whitespace-nowrap transition-colors"
                      >
                        Track Order
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}