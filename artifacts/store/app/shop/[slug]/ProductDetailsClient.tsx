'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { Star, Heart, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import ProductReviews from '@/components/ProductReviews';
import CartSidebar from '@/components/CartSidebar';
import type { Variation } from '@/lib/db';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
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
  variations: Variation[];
}

interface ProductDetailsClientProps {
  product: Product;
}

function matchVariation(variations: Variation[], color: string, size: string): Variation | null {
  if (!variations.length) return null;

  const normalize = (s: string) => s.toLowerCase().trim();

  const isColorAttr = (name: string) => /color|colour/i.test(name);
  const isSizeAttr = (name: string) => /size/i.test(name);

  return (
    variations.find((v) => {
      const colorAttr = v.attributes.find((a) => isColorAttr(a.name));
      const sizeAttr = v.attributes.find((a) => isSizeAttr(a.name));
      const colorOk = !colorAttr || normalize(colorAttr.option) === normalize(color);
      const sizeOk = !sizeAttr || normalize(sizeAttr.option) === normalize(size);
      return colorOk && sizeOk;
    }) ||
    variations.find((v) =>
      v.attributes.some((a) => isSizeAttr(a.name) && normalize(a.option) === normalize(size))
    ) ||
    variations[0]
  );
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0] || 'https://picsum.photos/seed/placeholder/600/800');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { addItem } = useCart();
  const { toggleWishlist, hasItem } = useWishlist();
  const isLiked = hasItem(product.id);

  const hasVariations = product.variations && product.variations.length > 0;

  const activeVariation = useMemo(() => {
    if (!hasVariations) return null;
    return matchVariation(product.variations, selectedColor, selectedSize);
  }, [product.variations, selectedColor, selectedSize, hasVariations]);

  const displayPrice = activeVariation
    ? (activeVariation.sale_price ?? activeVariation.price)
    : (product.sale_price ?? product.base_price);

  const displayOriginalPrice = activeVariation
    ? (activeVariation.sale_price !== null ? activeVariation.regular_price : null)
    : (product.sale_price !== null ? product.base_price : null);

  const displayStock = activeVariation ? activeVariation.stock : product.stock_total;
  const isInStock = displayStock > 0;

  const discountPct = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  const isSizeAvailableForColor = (size: string) => {
    if (!hasVariations) return true;
    const v = matchVariation(product.variations, selectedColor, size);
    return v !== null && v.stock > 0;
  };

  const isSizeExistsForColor = (size: string) => {
    if (!hasVariations) return true;
    return product.variations.some((v) => {
      const colorAttr = v.attributes.find((a) => /color|colour/i.test(a.name));
      const sizeAttr = v.attributes.find((a) => /size/i.test(a.name));
      const colorOk = !colorAttr || colorAttr.option.toLowerCase() === selectedColor.toLowerCase();
      const sizeOk = !sizeAttr || sizeAttr.option.toLowerCase() === size.toLowerCase();
      return colorOk && sizeOk;
    });
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: activeVariation ? activeVariation.id : `${product.id}-${selectedColor}-${selectedSize}`,
      name: product.name,
      imageUrl: (activeVariation?.image) || product.images[0] || selectedImage,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      unitPrice: displayPrice,
      maxStock: displayStock,
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
            {displayOriginalPrice && (
              <span className="absolute top-4 left-4 bg-[#FE5733] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm shadow-md animate-pulse">
                ON SALE
              </span>
            )}
          </div>

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
            <p className="text-xs font-bold uppercase tracking-widest text-[#FE5733] mb-2">{product.brand}</p>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#121212] font-display leading-tight">{product.name}</h1>

            {product.rating_avg > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-3.5 h-3.5"
                      fill={star <= Math.round(product.rating_avg) ? '#FE5733' : 'transparent'}
                      stroke={star <= Math.round(product.rating_avg) ? '#FE5733' : '#d1d5db'}
                    />
                  ))}
                </div>
                <span className="text-xs text-stone-500 font-medium">({product.rating_count} reviews)</span>
              </div>
            )}
          </div>

          {/* Pricing — updates reactively with variant */}
          <div className="border-y border-black/5 py-6 flex items-baseline gap-4">
            <span className="text-3xl font-black text-[#121212] font-display">
              Rs {displayPrice.toLocaleString()}
            </span>
            {displayOriginalPrice && (
              <>
                <span className="text-xl text-stone-400 line-through font-medium">
                  Rs {displayOriginalPrice.toLocaleString()}
                </span>
                {discountPct > 0 && (
                  <span className="bg-[#FE5733]/10 text-[#FE5733] text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                    SAVE {discountPct}%
                  </span>
                )}
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
              <label className="text-xs font-bold uppercase tracking-widest text-stone-700 block">
                Size: <span className="text-[#121212]">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const exists = isSizeExistsForColor(sz);
                  const inStock = isSizeAvailableForColor(sz);
                  if (!exists) return null;
                  return (
                    <button
                      key={sz}
                      onClick={() => inStock && setSelectedSize(sz)}
                      disabled={!inStock}
                      className={`min-w-12 h-12 text-xs font-bold uppercase tracking-wider rounded-[4px] border-2 transition-all duration-200 ease-out relative ${
                        selectedSize === sz
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-95 cursor-pointer'
                          : inStock
                          ? 'bg-white border-stone-300 hover:border-zinc-400 hover:text-zinc-900 text-stone-800 hover:scale-105 active:scale-95 cursor-pointer'
                          : 'bg-white border-stone-200 text-stone-300 cursor-not-allowed'
                      }`}
                    >
                      {sz}
                      {!inStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="absolute w-full h-[1px] bg-stone-300 rotate-[-35deg]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colorway Selector */}
          {product.colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-700 block">
                Color: <span className="text-[#121212]">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-4 h-11 text-xs font-bold uppercase tracking-wider rounded-[4px] border-2 cursor-pointer transition-all duration-200 ease-out ${
                      selectedColor === col
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-95'
                        : 'bg-white border-stone-300 hover:border-zinc-400 hover:text-zinc-900 text-stone-800 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock indicator */}
          {isInStock && displayStock <= 5 && (
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
              Only {displayStock} left in stock — order soon!
            </p>
          )}

          {/* Add Actions row */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {/* Quantity selector */}
            <div className={`flex items-center h-14 border-2 border-stone-200 rounded-[4px] bg-[#F5F5F0]/50 px-4 gap-4 sm:w-36 justify-between hover:border-[#FE5733]/30 transition-all duration-300 ${!isInStock ? 'opacity-50 grayscale' : ''}`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!isInStock}
                className="text-[#121212] hover:text-[#FE5733] hover:scale-110 p-1 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Decrease Quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold font-mono text-[#121212]">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
                disabled={!isInStock || quantity >= displayStock}
                className="text-[#121212] hover:text-[#FE5733] hover:scale-110 p-1 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Increase Quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Bag button */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="flex-grow h-14 bg-[#FE5733] text-white rounded-[4px] font-bold uppercase tracking-widest hover:bg-[#121212] transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-xl hover:-translate-y-1 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
            >
              <ShoppingBag className="w-5 h-5" />
              {!isInStock ? 'Out of Stock' : 'Add to Shopping Bag'}
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
            <div className="bg-[#FE5733] text-white text-xs font-bold uppercase tracking-widest p-4 rounded-[4px] flex items-center justify-between shadow-lg">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white stroke-[3px]" />
                Added to bag
                {selectedSize && ` — Size: ${selectedSize}`}
                {selectedColor && `, ${selectedColor}`}
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
              <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500">Product Details</h4>
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
