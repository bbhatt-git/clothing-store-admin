'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

interface CategoryCarouselProps {
  categories: Category[];
  customCategoryImages: Record<string, string>;
}

export default function CategoryCarousel({ categories, customCategoryImages }: CategoryCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);

  const next = () => {
    if (startIndex + 2 < categories.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const prev = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  const visibleCategories = categories.slice(startIndex, startIndex + 2);

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black tracking-[0.2em] text-[#E11D48] bg-[#E11D48]/8 px-3 py-1 rounded-full uppercase w-fit">
            Design Palette
          </h2>
          <h3 className="text-2xl md:text-3.5xl font-extrabold text-zinc-900 tracking-tight uppercase">
            OTHER FASHION CATEGORY
          </h3>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button 
            onClick={prev}
            disabled={startIndex === 0}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs ${startIndex === 0 ? 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed' : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 hover:scale-105 hover:shadow-md cursor-pointer active:scale-95'}`}
            aria-label="Previous categories"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={next}
            disabled={startIndex + 2 >= categories.length}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs ${startIndex + 2 >= categories.length ? 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed' : 'bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800 hover:scale-105 hover:shadow-md cursor-pointer active:scale-95'}`}
            aria-label="Next categories"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {visibleCategories.map((cat) => {
          const displayImage = customCategoryImages[cat.slug] || cat.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600';
          return (
            <div 
              key={cat.id}
              className="flex bg-white rounded-[24px] md:rounded-[32px] overflow-hidden border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] group hover:shadow-md transition-all duration-500 ease-out animate-fade-in"
            >
              {/* Left Side: info block */}
              <div className="flex-1 p-6 sm:p-10 lg:p-12 flex flex-col justify-between items-start space-y-8">
                <div className="space-y-2">
                  <h4 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight uppercase leading-none">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-zinc-400 font-medium leading-relaxed max-w-[210px]">
                    Explore our stylish and trendy selections for premium boutique {cat.name.toLowerCase()}!
                  </p>
                </div>

                <Link 
                  href={`/shop?category=${cat.slug}`}
                  className="inline-flex items-center gap-2 border border-zinc-200 hover:border-zinc-900 font-black text-[10px] md:text-xs uppercase tracking-wider px-5 py-3 rounded-full bg-white hover:bg-zinc-50 text-zinc-800 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs hover:shadow-sm"
                >
                  EXPLORE PRODUCT <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right Side: Image container */}
              <div className="w-[42%] md:w-[48%] relative bg-zinc-50 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={displayImage} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
