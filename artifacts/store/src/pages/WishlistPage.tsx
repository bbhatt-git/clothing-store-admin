import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/store/wishlistStore';
import { Heart, ArrowLeft } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface Product {
  id: string; name: string; slug: string; brand: string;
  base_price: number; sale_price: number | null; discount_pct: number;
  images: string[]; rating_avg: number; rating_count: number; stock_total: number;
  is_active: boolean; is_featured: boolean; created_at: string;
  description: string; categories: string[]; colors: string[]; sizes: string[];
}

export default function WishlistPage() {
  const { itemIds } = useWishlist();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/products`)
      .then(r => r.json())
      .then(data => { if (data.success) setAllProducts(data.products || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const wishlistedProducts = allProducts.filter(p => itemIds.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="flex-grow py-12 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">THE STYLE ZONE • WISHLIST</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display">
              My <span className="text-[#FE5733]">Favorites.</span>
            </h1>
            <p className="text-sm opacity-60 max-w-xl mt-2 leading-relaxed">
              Curate and lock in your favorite designs. Keep track of limited stocks and seasonal updates.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-stone-200 rounded-[4px]" />
              ))}
            </div>
          ) : wishlistedProducts.length === 0 ? (
            <div className="text-center py-24 bg-white border border-[#121212]/5 rounded-[4px] max-w-md mx-auto p-8 shadow-sm">
              <Heart className="w-12 h-12 text-[#121212]/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#121212]">Wishlist is Empty</h3>
              <p className="text-xs text-[#121212]/50 mt-1 max-w-sm mx-auto leading-relaxed mb-8">
                Save items that speak to your style by tapping the heart icon on any product page.
              </p>
              <Link href="/shop" className="bg-[#121212] text-white px-8 py-4 rounded-[4px] font-bold uppercase text-xs tracking-widest hover:bg-[#FE5733] transition-all duration-300">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-[4px] border border-[#121212]/5 shadow-sm">
                <p className="text-xs font-mono font-bold text-[#121212]/60">HEARTED ITEMS ({wishlistedProducts.length})</p>
                <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-[#121212] hover:text-[#FE5733] flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Shop
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {wishlistedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
