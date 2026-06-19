import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';
import ShopClient from '@/pages/ShopClient';
import { useSearch } from 'wouter';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface Product {
  id: string; name: string; slug: string; brand: string;
  base_price: number; sale_price: number | null; discount_pct: number;
  images: string[]; rating_avg: number; rating_count: number; stock_total: number;
  is_active: boolean; is_featured: boolean; created_at: string;
  description: string; categories: string[]; colors: string[]; sizes: string[];
}

export default function ShopPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/products`)
      .then(r => r.json())
      .then(data => { if (data.success) setProducts(data.products || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="flex-grow px-6 md:px-10 pt-8 md:pt-12 pb-8 md:pb-12">
        <div className="max-w-[1560px] mx-auto">
          <div className="mb-8 md:mb-12">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">THE STYLE ZONE • COLLECTION</p>
            <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display">
              All <span className="text-[#FE5733]">Collections.</span>
            </h1>
            <p className="text-sm opacity-60 max-w-xl mt-2 leading-relaxed">
              Explore 100% authentic curated apparel synced directly from our WooCommerce store. Filter by category, price, size, and color below.
            </p>
          </div>
          {loading ? (
            <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-[#121212]/5 p-4 rounded-[4px] bg-white space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-neutral-200 rounded-[4px] w-full" />
                  <div className="h-3.5 bg-neutral-200 rounded-[4px] w-1/3" />
                  <div className="h-4 bg-neutral-200 rounded-[4px] w-4/5" />
                </div>
              ))}
            </div>
          ) : (
            <ShopClient
              initialProducts={products}
              initialCategory={params.get('category') || undefined}
              initialSize={params.get('size') || undefined}
              initialColor={params.get('color') || undefined}
              initialSearch={params.get('search') || undefined}
            />
          )}
        </div>
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
