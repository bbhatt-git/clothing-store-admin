'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { Star, Heart, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import ProductReviews from '@/components/ProductReviews';
import CartSidebar from '@/components/CartSidebar';

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
  description: string;
  short_description: string;
  categories: string[];
  colors: string[];
  sizes: string[];
  sku: string;
}

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0] || 'https://picsum.photos/seed/placeholder/600/800');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { addItem } = useCart();
  const { toggleWishlist, hasItem } = useWishlist();
  const isLiked = hasItem(product.id);

  const price = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.base_price;
  const originalPrice = product.sale_price !== null && product.sale_price !== undefined ? product.base_price : null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: `${product.id}-${selectedColor}-${selectedSize}`,
      name: product.name,
      imageUrl: product.images[0] || selectedImage,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      unitPrice: price,
      maxStock: product.stock_total,
    });

    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start bg-white p-6 md:p-10 rounded-[4px] border border-black/5 shadow-sm">
        
        {/* Product Images Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[3/4] bg-stone-100 overflow-hidden rounded-[4px] relative border-2 border-transparent hover:border-[#FE5733]/30 transition-all duration-300 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            {originalPrice && (
              <span className="absolute top-4 left-4 bg-[#FE5733] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm shadow-md animate-pulse">
                ON SALE
              </span>
            )}
          </div>

          {/* Thumbs list */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 aspect-[3/4] bg-stone-100 rounded-[4px] overflow-hidden border-2 cursor-pointer shrink-0 transition-all duration-300 ${
                    selectedImage === img
                      ? 'border-[#FE5733] scale-[1.05] shadow-lg'
                      : 'border-transparent opacity-80 hover:opacity-100 hover:scale-[1.02] hover:border-stone-300'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Column */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#121212] font-display leading-tight">{product.name}</h1>
          </div>

          {/* Pricing */}
          <div className="border-y border-black/5 py-6 flex items-baseline gap-4">
            <span className="text-3xl font-black text-[#121212] font-display">Rs {price.toLocaleString()}</span>
            {originalPrice && (
              <>
                <span className="text-xl text-stone-400 line-through font-medium">Rs {originalPrice.toLocaleString()}</span>
                <span className="bg-[#FE5733]/10 text-[#FE5733] text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                  SAVE {product.discount_pct}%
                </span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <div 
              className="text-sm text-stone-600 leading-relaxed font-sans wordpress-content"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Sizing Selector */}
          {product.sizes.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-700 block">Select Sizing</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    disabled={product.stock_total <= 0}
                    className={`min-w-12 h-12 text-xs font-bold uppercase tracking-wider rounded-[4px] border-2 cursor-pointer transition-all duration-200 ease-out ${
                      selectedSize === sz
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-95'
                        : 'bg-white border-stone-300 hover:border-zinc-400 hover:text-zinc-900 text-stone-800 hover:scale-105 active:scale-95'
                    } ${product.stock_total <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colorway Selector */}
          {product.colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-700 block">Select Colorway</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    disabled={product.stock_total <= 0}
                    className={`px-4 h-11 text-xs font-bold uppercase tracking-wider rounded-[4px] border-2 cursor-pointer transition-all duration-200 ease-out ${
                      selectedColor === col
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-95'
                        : 'bg-white border-stone-300 hover:border-zinc-400 hover:text-zinc-900 text-stone-800 hover:scale-105 active:scale-95'
                    } ${product.stock_total <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Actions row */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            
            {/* Quantity selector */}
            <div className={`flex items-center h-14 border-2 border-stone-200 rounded-[4px] bg-[#F5F5F0]/50 px-4 gap-4 sm:w-36 justify-between hover:border-[#FE5733]/30 transition-all duration-300 ${product.stock_total <= 0 ? 'opacity-50 grayscale' : ''}`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock_total <= 0}
                className="text-[#121212] hover:text-[#FE5733] hover:scale-110 p-1 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Decrease Quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold font-mono text-[#121212]">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_total, quantity + 1))}
                disabled={product.stock_total <= 0}
                className="text-[#121212] hover:text-[#FE5733] hover:scale-110 p-1 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Increase Quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Bag button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock_total <= 0}
              className="flex-grow h-14 bg-[#FE5733] text-white rounded-[4px] font-bold uppercase tracking-widest hover:bg-[#121212] transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-xl hover:-translate-y-1 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {product.stock_total <= 0 ? 'Out of Stock' : 'Add to Shopping Bag'}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-14 h-14 border-2 border-stone-300 hover:border-[#FE5733] hover:bg-[#FE5733] hover:text-white text-stone-600 rounded-[4px] flex items-center justify-center cursor-pointer transition-all duration-300 shrink-0 hover:shadow-md hover:-translate-y-1 group"
              aria-label="Add to Wishlist"
            >
              <Heart
                className="w-5 h-5 transition-transform group-hover:scale-110"
                fill={isLiked ? "#FE5733" : "transparent"}
                stroke={isLiked ? "#FE5733" : "currentColor"}
              />
            </button>
          </div>

          {/* Success Alert */}
          {addedMessage && (
            <div className="bg-[#FE5733] text-white text-xs font-bold uppercase tracking-widest p-4 rounded-[4px] flex items-center justify-between shadow-lg animate-slide-in">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white stroke-[3px]" />
                Added to bag (Size: {selectedSize}, Color: {selectedColor})
              </span>
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-white border-b-2 border-white/70 pb-0.5 hover:text-white/90 hover:border-white transition-all duration-300 font-bold uppercase tracking-wider text-xs hover:scale-105 inline-block"
              >
                View Bag
              </button>
            </div>
          )}

          {/* Full Details description markup */}
          {product.description && (
            <div className="border-t border-stone-200 pt-8 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500">Product Specifications</h4>
              <div 
                className="font-sans text-sm text-stone-600 leading-relaxed max-w-none wordpress-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

        </div>
      </div>
      
      {/* Product Reviews Section */}
      <ProductReviews productId={product.id} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
