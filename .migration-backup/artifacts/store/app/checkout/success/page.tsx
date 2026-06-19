'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, ClipboardList, ShoppingBag, Truck, Calendar, MapPin, CreditCard, Clock } from 'lucide-react';

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

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  municipality: string;
  wardNo: string;
  payment_method: string;
  payment_status: string;
  payment_txn_id: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
  status?: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('Order ID not provided');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        
        if (data.success && data.order) {
          setOrderData(data.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Failed to fetch order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Clock className="w-8 h-8 text-[#FE5733] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border border-amber-100">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#121212]">Order Not Found</h1>
            <p className="text-sm text-stone-500 mt-2 max-w-md">
              {error || 'We couldn&apos;t find your order. It may still be processing. Please check your orders page or contact support.'}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/orders" className="bg-[#121212] text-white rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#FE5733] transition-colors">
              View My Orders
            </Link>
            <Link href="/shop" className="border border-[#121212] text-[#121212] rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#121212] hover:text-white transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const orderItems = orderData.items || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex-grow space-y-8">
        
        {/* 1. SUCCESS BANNER */}
        <div className="bg-white border border-stone-200 rounded-lg p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-[#FE5733] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] bg-[#F5F5F0] text-[#121212] px-3 py-1 rounded-full uppercase tracking-wider font-bold font-mono">
              {orderData.payment_method === 'cod' || orderData.payment_method === 'cash_on_delivery' ? 'Order Confirmed' : 'Order Submitted'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#121212] font-display tracking-tight">Thank You for Your Order!</h1>
            <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
              Order <span className="font-mono text-[#FE5733] font-bold">{orderData.order_number}</span> has been received. We&apos;re preparing your items.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-4">
            {orderData.payment_method === 'cod' || orderData.payment_method === 'cash_on_delivery' ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-green-800 font-medium text-center">
                  <strong className="block mb-1">Order Confirmed — Pay on Delivery</strong>
                  We&apos;ll dispatch your order to {orderData.municipality} right away.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-amber-800 font-medium text-center">
                  <strong className="block mb-1">Awaiting Payment Verification</strong>
                  Transaction ID: <span className="font-mono">{orderData.payment_txn_id}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. ORDER DETAILS CARD */}
        <div className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-sm font-black text-[#121212] uppercase tracking-widest pb-3 border-b border-stone-100">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Meta */}
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <Calendar className="w-5 h-5 text-stone-400" />
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Date Ordered</p>
                  <p className="text-[#121212] font-bold">{new Date(orderData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <CreditCard className="w-5 h-5 text-stone-400" />
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Payment Method</p>
                  <p className="text-[#121212] font-bold uppercase">{orderData.payment_method.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>

            {/* Ship address */}
            <div className="flex gap-3 items-start">
              <MapPin className="w-5 h-5 text-stone-400 mt-0.5" />
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Shipping Address</p>
                <p className="text-[#121212] font-bold">{orderData.customer_name}</p>
                <p className="text-stone-500 text-sm mt-0.5">{orderData.shipping_address}, {orderData.municipality}, Ward {orderData.wardNo}</p>
                <p className="text-stone-400 text-xs">{orderData.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="pt-4 border-t border-stone-100 space-y-4">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Order Items</p>
            <div className="divide-y divide-stone-50">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center py-4 first:pt-0 last:pb-0">
                  <img src={item.image_url} alt={item.name} className="w-14 h-16 object-cover rounded bg-stone-50 border border-stone-100 flex-none" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#121212]">{item.name}</p>
                    <p className="text-xs text-stone-400">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
                  </div>
                  <span className="text-sm font-bold text-[#121212] font-mono">Rs {(item.total_price || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing aggregates */}
          <div className="border-t border-stone-100 pt-4 flex flex-col items-end gap-2 text-sm">
            <div className="flex justify-between w-full max-w-xs">
              <span className="text-stone-500">Subtotal</span>
              <span className="text-[#121212] font-mono">Rs {(orderData.subtotal || 0).toLocaleString()}</span>
            </div>
            {(orderData.discount_amount || 0) > 0 && (
              <div className="flex justify-between w-full text-[#FE5733]">
                <span>Discount</span>
                <span className="font-mono">-Rs {(orderData.discount_amount || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between w-full text-stone-500">
              <span>Shipping</span>
              <span className="text-[#121212] font-mono">Rs {(orderData.shipping_fee || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-lg font-black text-[#121212] border-t border-stone-100 pt-2 mt-2">
              <span>Total</span>
              <span className="text-[#FE5733] font-mono">Rs {(orderData.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 3. ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/orders" className="bg-[#121212] hover:bg-[#FE5733] text-white rounded-lg p-4 text-sm font-bold uppercase tracking-widest transition-colors text-center">
            View My Orders
          </Link>
          <Link href="/shop" className="border border-[#121212] text-[#121212] hover:bg-[#121212] hover:text-white rounded-lg p-4 text-sm font-bold uppercase tracking-widest transition-colors text-center">
            Continue Shopping
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Clock className="w-8 h-8 text-[#FE5733] animate-spin" />
        </div>
        <Footer />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}