'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, TrendingUp, Tag, ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  base_price: number;
  sale_price: number | null;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
}

export default function SearchOverlay({ isOpen, onClose, allProducts }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
    }
  }, [searchQuery]);

  // Filter products based on search
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    product.slug.toLowerCase().includes(debouncedQuery.toLowerCase())
  ).slice(0, 6); // Show max 6 results

  // Trending searches (static for now, could be dynamic)
  const trendingSearches = [
    'Hoodies',
    'Jackets',
    'T-Shirts',
    'Summer Collection',
    'New Arrivals'
  ];

  // Popular categories
  const popularCategories = [
    { name: 'Hoodies', slug: 'hoodies', count: 24 },
    { name: 'Jackets', slug: 'jackets', count: 18 },
    { name: 'T-Shirts', slug: 'tshirts', count: 32 },
    { name: 'Accessories', slug: 'accessories', count: 15 }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Search overlay */}
      <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 md:pt-32 px-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col max-h-[80vh]"
             style={{ touchAction: 'pan-y' }}
        >
          
          {/* Search input header */}
          <div className="p-6 border-b border-black/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-12 py-4 bg-stone-50 border border-black/10 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-xl text-base outline-none transition-all duration-200"
                autoFocus
              />
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Search results */}
          <div className="flex-1 overflow-y-auto"
               style={{ 
                 WebkitOverflowScrolling: 'touch',
                 msOverflowStyle: 'none',
                 scrollbarWidth: 'auto'
               }}
          >
            {!searchQuery ? (
              <>
                {/* Trending Searches */}
                <div className="p-6 border-b border-black/5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#FE5733]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#121212]">Trending Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => {
                          setSearchQuery(search);
                        }}
                        className="px-4 py-2 bg-stone-100 hover:bg-[#FE5733] hover:text-white rounded-full text-sm font-medium transition-all duration-200"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Categories */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-[#FE5733]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#121212]">Popular Categories</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {popularCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/shop?category=${category.slug}`}
                        onClick={onClose}
                        className="group flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all duration-200"
                      >
                        <div>
                          <p className="font-medium text-[#121212] group-hover:text-[#FE5733] transition-colors">{category.name}</p>
                          <p className="text-xs text-stone-500 mt-1">{category.count} products</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-[#FE5733] group-hover:translate-x-1 transition-all duration-200" />
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Search Results */}
                {filteredProducts.length > 0 ? (
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 px-2">
                      {filteredProducts.length} Results for "{searchQuery}"
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredProducts.map((product) => {
                        const price = product.sale_price || product.base_price;
                        return (
                          <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            onClick={onClose}
                            className="flex gap-4 p-3 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all duration-200 group"
                          >
                            <div className="w-20 h-24 bg-white rounded-lg overflow-hidden shrink-0 border border-black/5">
                              <img
                                src={product.images[0] || 'https://picsum.photos/seed/placeholder/200/240'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="font-medium text-[#121212] text-sm line-clamp-2 group-hover:text-[#FE5733] transition-colors">
                                {product.name}
                              </p>
                              <p className="text-sm font-bold text-zinc-900 mt-1">Rs {price.toLocaleString()}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Search className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500 font-medium">No products found for "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-sm font-bold text-[#FE5733] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}