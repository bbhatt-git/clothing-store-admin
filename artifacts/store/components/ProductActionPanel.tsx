'use client';

import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { Heart, Plus, Minus, ShoppingCart, Share2, Check } from 'lucide-react';

interface Variant {
  id: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
  price_delta: number;
  sku: string;
}

interface ProductActionPanelProps {
  product: {
    id: string;
    name: string;
    brand: string;
    base_price: number;
    sale_price?: number | null;
    discount_pct: number;
    images: string[];
    stock_total: number;
  };
  variants: Variant[];
}

export default function ProductActionPanel({ product, variants }: ProductActionPanelProps) {
  const addItem = useCart(state => state.addItem);
  const { toggleWishlist, hasItem } = useWishlist();
  const isLiked = hasItem(product.id);

  // Group unique colors from variants
  const uniqueColorsMap: { [key: string]: string } = {};
  variants.forEach(v => {
    if (v.color) uniqueColorsMap[v.color] = v.color_hex;
  });
  const uniqueColors = Object.entries(uniqueColorsMap).map(([name, hex]) => ({ name, hex }));
  
  // States
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0]?.name || 'Default');
  const [selectedSize, setSelectedSize] = useState('M'); // default size
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Sync size selection if the new color doesn't have stock or exists
  useEffect(() => {
    // Check if the current size is available for the newly selected color
    const sizesForColor = variants.filter(v => v.color === selectedColor);
    const matchingVariant = sizesForColor.find(v => v.size === selectedSize);
    
    // Auto-select first available size if current one is not valid
    if (!matchingVariant || matchingVariant.stock <= 0) {
      const firstInStock = sizesForColor.find(v => v.stock > 0);
      if (firstInStock) {
        queueMicrotask(() => setSelectedSize(firstInStock.size));
      } else if (sizesForColor.length > 0) {
        queueMicrotask(() => setSelectedSize(sizesForColor[0].size));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor, variants]);

  // Find active variant corresponding to size + color selection
  const activeVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize) || variants[0];
  
  // Fallback if no variants exist
  if (!activeVariant) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="text-sm font-bold">Product variants not available</p>
        <p className="text-xs mt-1">This product cannot be added to cart right now. Please contact support.</p>
      </div>
    );
  }
  
  const currentUnitPrice = (product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.base_price) + (activeVariant?.price_delta || 0);
  const currentOriginalPrice = product.sale_price !== null && product.sale_price !== undefined ? (product.base_price + (activeVariant?.price_delta || 0)) : null;

  const maxStockLimit = activeVariant?.stock || 0;

  const handleAddToCart = () => {
    if (!activeVariant || maxStockLimit <= 0) return;

    const cartItem: CartItem = {
      productId: product.id,
      variantId: activeVariant.id,
      name: product.name,
      imageUrl: product.images[0] || 'https://picsum.photos/seed/cartplaceholder/300/400',
      size: selectedSize,
      color: selectedColor,
      colorHex: activeVariant.color_hex,
      quantity,
      unitPrice: currentUnitPrice,
      maxStock: maxStockLimit
    };

    addItem(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. PRICE METRICS AREA */}
      <div className="space-y-2 bg-zinc-50 border border-zinc-100 rounded-3xl p-6 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl font-black text-zinc-950 tracking-tight">
            Rs {currentUnitPrice.toLocaleString()}
          </span>
          {currentOriginalPrice && (
            <span className="text-xl text-red-500/80 line-through font-bold">
              Rs {currentOriginalPrice.toLocaleString()}
            </span>
          )}
        </div>
        {product.discount_pct > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              {product.discount_pct}% OFF
            </span>
            <p className="text-[11px] text-red-600 font-bold uppercase tracking-widest">
              SAVE Rs {(currentOriginalPrice! - currentUnitPrice).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* 2. COLOR PICKER */}
      {uniqueColors.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Color: <strong className="text-zinc-900 font-extrabold font-sans">{selectedColor}</strong></span>
          </label>
          <div className="flex gap-2">
            {uniqueColors.map((color) => {
              const borderStyles = selectedColor === color.name 
                ? 'ring-2 ring-brand ring-offset-2' 
                : 'hover:scale-105';
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-8 h-8 rounded-full border border-zinc-300 outline-hidden transition-all cursor-pointer ${borderStyles}`}
                  style={{ backgroundColor: `#${color.hex}` }}
                  title={color.name}
                  aria-label={`Select color ${color.name}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SIZE SELECTOR WITH INVENTORY CHECKS */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
          <span>Size Option: <strong className="text-zinc-900 font-extrabold font-sans">{selectedSize}</strong></span>
          {activeVariant && (
            <span className={`text-[10px] font-bold ${maxStockLimit > 3 ? 'text-zinc-400' : 'text-red-500 font-extrabold'}`}>
              {maxStockLimit > 0 ? `Stock Left: ${maxStockLimit}` : 'Out of Stock'}
            </span>
          )}
        </label>
        
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(variants.map(v => v.size))).map((size) => {
            const vOpt = variants.find(v => v.color === selectedColor && v.size === size);
            const sizeInStock = vOpt && vOpt.stock > 0;
            const isSelected = selectedSize === size;
            
            let btnClass = 'border-zinc-200 text-zinc-800 bg-white hover:border-zinc-400';
            if (isSelected) {
              btnClass = 'bg-zinc-900 text-white border-zinc-900 font-bold';
            } else if (!vOpt) {
                // Size doesn't exist for this color
                btnClass = 'hidden';
            } else if (!sizeInStock) {
              btnClass = 'opacity-30 border-dashed border-zinc-200 text-zinc-300 pointer-events-none cursor-not-allowed';
            }
            
            if (!vOpt) return null;

            return (
              <button
                key={size}
                disabled={!sizeInStock}
                onClick={() => setSelectedSize(size)}
                className={`text-xs font-heavy tracking-wider h-11 px-4 sm:px-6 rounded-full border transition-all cursor-pointer flex items-center justify-center min-w-14 sm:min-w-16 ${btnClass}`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. QUANTITY CONTROLLER STEPPER */}
      {maxStockLimit > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Quantity Selection</label>
          <div className="flex items-center border border-zinc-200 rounded-full w-fit bg-zinc-50 p-1 shadow-xs">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuantity(prev => Math.max(1, prev - 1)); }}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-zinc-700 transition-colors disabled:opacity-30 cursor-pointer"
              aria-label="Reduce quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-sm font-bold font-sans text-zinc-900">{quantity}</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuantity(prev => Math.min(maxStockLimit, prev + 1)); }}
              disabled={quantity >= maxStockLimit}
              className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-zinc-700 transition-colors disabled:opacity-30 cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. ADD TO CART AND WISHLIST CTA ACTION BUTTONS */}
      <div className="flex items-center gap-2 md:gap-3 pt-4">
        {maxStockLimit <= 0 ? (
          <button
            disabled
            className="flex-1 bg-zinc-200 text-zinc-400 h-12 rounded-full text-xs font-black uppercase tracking-wider cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`flex-1 ${added ? 'bg-zinc-700' : 'bg-zinc-900 hover:bg-black'} text-white h-12 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 shadow-xl cursor-pointer px-3 sm:px-6`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 animate-bounce shrink-0" /> Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 shrink-0" /> <span className="hidden xs:inline">Add to Bag</span><span className="xs:hidden">Add to Bag</span>
              </>
            )}
          </button>
        )}

        <div className="flex gap-1.5 md:gap-2 shrink-0">
          {/* Heart Wishlist Toggler */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="w-12 h-12 rounded-full border border-zinc-200 hover:border-zinc-400 bg-white shadow-xs flex items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500 scale-105' : 'text-zinc-500'}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="w-12 h-12 rounded-full border border-zinc-200 hover:border-zinc-400 bg-white shadow-xs flex items-center justify-center transition-all cursor-pointer relative shrink-0"
            aria-label="Share style"
          >
            {copiedShare ? (
              <Check className="w-5 h-5 text-green-500 animate-pulse" />
            ) : (
              <Share2 className="w-5 h-5 text-zinc-500" />
            )}
            
            {copiedShare && (
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-zinc-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap animate-bounce">
                Link Copied!
              </span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
