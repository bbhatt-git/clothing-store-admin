import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';
import ProductDetailsClient from '@/pages/ProductDetailsClient';
import { ChevronRight } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`${BASE}/api/products/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError('Product not found');
        }
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
        <div className="h-16 bg-white border-b border-[#121212]/10 animate-pulse" />
        <main className="flex-grow px-6 md:px-10 py-8 md:py-12">
          <div className="max-w-[1560px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start bg-white p-6 md:p-10 rounded-[4px] border border-stone-200 shadow-sm">
              <div className="lg:col-span-6">
                <div className="aspect-[3/4] bg-stone-200 rounded-[4px] animate-pulse" />
              </div>
              <div className="lg:col-span-6 space-y-8">
                <div className="h-10 bg-stone-200 rounded w-3/4 animate-pulse" />
                <div className="h-10 bg-stone-200 rounded w-1/3 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#FE5733] mb-4">404</h1>
            <p className="text-lg font-bold text-[#121212] mb-6">{error || 'Product not found'}</p>
            <Link href="/shop" className="bg-[#121212] text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-[#FE5733] transition-colors">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="flex-grow px-6 md:px-10 py-8 md:py-12">
        <div className="max-w-[1560px] mx-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-8">
            <Link href="/" className="hover:text-[#FE5733] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-[#FE5733] transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#121212] font-bold truncate max-w-[200px]">{product.name}</span>
          </div>
          <ProductDetailsClient product={product} />
        </div>
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
