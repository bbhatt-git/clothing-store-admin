'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/store/wishlistStore';
import ProductCard from '@/components/ProductCard';
import { Heart, ArrowLeft, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  base_price: number;
  sale_price: number | null;
  discount_pct: number;
  images: string[];
  rating_avg: number;
  rating_count: number;
  stock_total: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  description: string;
  categories: string[];
  colors: string[];
  sizes: string[];
}

interface WishlistClientProps {
  allProducts: Product[];
}

export default function WishlistClient({ allProducts }: WishlistClientProps) {
  const { itemIds } = useWishlist();

  // Find products that are wishlisted
  const wishlistedProducts = allProducts.filter((p) => itemIds.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-[4px] border border-[#121212]/5 shadow-sm">
        <p className="text-xs font-mono font-bold text-[#121212]/60">
          HEARTED ITEMS ({wishlistedProducts.length})
        </p>
        <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-[#121212] hover:text-[#FE5733] flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlistedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
