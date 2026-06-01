'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchOverlay from '@/components/SearchOverlay';

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
  short_description?: string;
  categories: string[];
  colors: string[];
  sizes: string[];
}

interface HeroClientProps {
  featuredProducts: Product[];
}

export default function HeroClient({ featuredProducts }: HeroClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Auto-scroll functionality
  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
        setTimeout(() => setIsAnimating(false), 100);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  const currentProduct = featuredProducts[currentSlide] || featuredProducts[0];

  const getPrice = (product: Product) => {
    return product.sale_price || product.base_price;
  };

  return (
    <section className="w-full bg-[#F5F5F0]">
      <div className="max-w-[1560px] mx-auto px-6 md:px-10 py-12 md:py-20">
        
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          
          {/* Left Column - Text Content */}
          <header className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 border border-[#FE5733]/30 rounded-sm px-4 py-2 w-fit">
              <div className="w-2 h-2 bg-[#FE5733] rounded-full" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#FE5733] font-mono whitespace-nowrap">
                New Collection {new Date().getFullYear()}
              </span>
            </div>

            <h1 className="text-5xl leading-tight font-bold text-balance md:text-6xl lg:text-7xl uppercase tracking-tighter text-[#121212] font-display">
              Discover <span className="text-[#FE5733]">Style.</span>
            </h1>

            <p className="text-[#121212]/60 max-w-lg text-xl text-balance leading-relaxed">
              Explore our curated collection of premium garments. Each piece is handpicked for those who appreciate quality and timeless style.
            </p>

            <div className="relative max-w-md">
              <div 
                className="cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
              >
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  className="h-14 w-full rounded-sm border border-stone-300 bg-white pe-24 pl-12 text-sm text-[#121212] placeholder:text-stone-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 outline-none transition-all duration-200 ease-in-out cursor-pointer"
                  readOnly
                />
                <svg className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link 
                href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                className="absolute end-2 top-1/2 -translate-y-1/2 inline-flex cursor-pointer items-center justify-center rounded-sm bg-[#121212] px-6 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#FE5733] transition-colors h-10 whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  if (searchQuery) {
                    setIsSearchOpen(false);
                  }
                }}
              >
                Search
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href="/shop" className="inline-flex h-10 cursor-pointer items-center justify-center rounded-sm bg-[#121212] px-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#FE5733] transition-colors whitespace-nowrap w-full sm:w-auto">
                Shop Now
                <svg className="ml-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link href="/shop" className="inline-flex h-10 cursor-pointer items-center justify-center rounded-sm border border-[#121212] px-6 text-xs font-bold uppercase tracking-widest text-[#121212] hover:bg-[#121212] hover:text-white transition-colors whitespace-nowrap w-full sm:w-auto">
                <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                View Catalog
              </Link>
            </div>
          </header>

          {/* Right Column - Carousel */}
          <div className="flex flex-col gap-4">
            {currentProduct && (
              <>
                <div className="relative h-[500px] w-full overflow-hidden rounded-lg shadow-sm bg-white">
                  
                  {/* Featured Product Display */}
                  <div className={`relative h-full transition-all duration-700 ease-out ${isAnimating ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                    {/* Product Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={currentProduct.images?.[0] || 'https://images.pexels.com/photos/17474229/pexels-photo-17474229.jpeg?auto=compress&cs=tinysrgb&w=1200&lazy=load'}
                      alt={currentProduct.name}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Content Overlay */}
                    <div className={`absolute inset-0 flex flex-col justify-end p-8 transition-all duration-700 delay-100 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      <div className="relative z-10 max-w-md flex flex-col gap-4">
                        <span className="inline-block w-fit rounded-sm border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                          {currentProduct.categories?.[0] || 'Featured'}
                        </span>
                        <h2 className="text-4xl font-bold uppercase tracking-tight text-white">
                          {currentProduct.name}
                        </h2>
                        <p className="text-white/80 text-lg leading-relaxed line-clamp-2">
                          Elevate your everyday style with premium quality fabrics and timeless designs crafted for the modern individual.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                          <Link 
                            href={`/shop/${currentProduct.slug}`}
                            className="group inline-flex h-12 cursor-pointer items-center justify-center rounded-sm bg-[#FE5733] px-8 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-[#121212] hover:shadow-lg whitespace-nowrap"
                          >
                            View Product
                            <svg className="ml-2 size-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Price Badge */}
                    <div className={`absolute start-8 top-8 rounded-sm bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm transition-all duration-700 delay-200 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                      <div className="flex items-center gap-2">
                        {currentProduct.sale_price ? (
                          <>
                            <span className="text-lg font-bold text-[#FE5733]">Rs {currentProduct.sale_price.toLocaleString()}</span>
                            <span className="text-sm text-stone-400 line-through">Rs {currentProduct.base_price.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-[#121212]">Rs {currentProduct.base_price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Trending Badge */}
                    <div className={`absolute end-8 top-8 flex items-center gap-1 rounded-sm bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm transition-all duration-700 delay-300 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                      <svg className="size-4 text-[#FE5733]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
                      </svg>
                      Trending
                    </div>
                  </div>

                </div>

                {/* Navigation Dots */}
                {featuredProducts.length > 1 && (
                  <div className="relative mt-8 flex justify-center gap-3">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsAnimating(true);
                          setTimeout(() => {
                            setCurrentSlide(index);
                            setTimeout(() => setIsAnimating(false), 100);
                          }, 300);
                        }}
                        className={`relative size-3 rounded-sm transition-all ${currentSlide === index ? 'bg-[#FE5733] scale-125' : 'bg-[#121212]/20 hover:bg-[#121212]/40'}`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={currentSlide === index ? 'step' : undefined}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        allProducts={featuredProducts}
      />
    </section>
  );
}
