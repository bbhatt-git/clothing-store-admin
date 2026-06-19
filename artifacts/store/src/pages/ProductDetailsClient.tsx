import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { Star, Heart, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import ProductReviews from '@/components/ProductReviews';
import CartSidebar from '@/components/CartSidebar';

interface Attribute { name: string; option: string; }
interface Variation {
  id: string;
  price: number;
  regular_price: number;
  sale_price: number | null;
  stock: number;
  image: string | null;
  attributes: Attribute[];
}

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
    variations.find((v) => v.attributes.some((a) => isSizeAttr(a.name) && normalize(a.option) === normalize(size))) ||
    variations[0]
  );
}

export default function ProductDetailsClient({ product }: { product: Product }) {
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

  const displayPrice = activeVariation ? (activeVariation.sale_price ?? activeVariation.price) : (product.sale_price ?? product.base_price);
  const displayOriginalPrice = activeVariation ? (activeVariation.sale_price !== null ? activeVariation.regular_price : null) : (product.sale_price !== null ? product.base_price : null);
  const displayStock = activeVariation ? activeVariation.stock : product.stock_total;
  const isInStock = displayStock > 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: activeVariation ? activeVariation.id : `${product.id}-${selectedColor}-${selectedSize}`,
      name: product.name,
      imageUrl: (activeVariation?.image) || product.images[0] || selectedImage,
      size: selectedSize,
      color: selectedColor,
      quantity,
      unitPrice: displayPrice,
      maxStock: displayStock,
    });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
    setIsCartOpen(true);
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start bg-white p-6 md:p-10 rounded-[4px] border border-black/5 shadow-sm">
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[3/4] bg-stone-100 overflow-hidden rounded-[4px] relative border-2 border-transparent hover:border-[#FE5733]/30 transition-all duration-300 group">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
            {displayOriginalPrice && (
              <span className="absolute top-4 left-4 bg-[#FE5733] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm shadow-md animate-pulse">ON SALE</span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(img)} className={`w-20 aspect-[3/4] shrink-0 rounded-[4px] overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-[#FE5733] scale-95' : 'border-stone-200 hover:border-stone-400'}`}>
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#FE5733] font-mono">{product.brand} • {product.categories[0] || 'Apparel'}</span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#121212] font-display mt-2 leading-tight">{product.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating_avg) ? 'fill-[#FE5733] text-[#FE5733]' : 'text-stone-200'}`} />
                ))}
              </div>
              <span className="text-xs text-stone-500 font-mono">({product.rating_count} reviews)</span>
            </div>
          </div>

          <div className="border-y border-stone-200 py-6">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-[#121212]">Rs {displayPrice.toLocaleString()}</span>
              {displayOriginalPrice && (
                <>
                  <span className="text-lg text-stone-400 line-through">Rs {displayOriginalPrice.toLocaleString()}</span>
                  <span className="bg-[#FE5733] text-white text-xs font-bold px-2 py-1 rounded-sm">
                    -{Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            <p className={`text-xs font-bold mt-2 ${isInStock ? 'text-green-600' : 'text-red-500'}`}>
              {isInStock ? `In Stock (${displayStock} available)` : 'Out of Stock'}
            </p>
          </div>

          {product.colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-600">Color: <span className="text-[#121212]">{selectedColor}</span></label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-sm border-2 transition-all ${selectedColor === color ? 'bg-[#121212] border-[#121212] text-white' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-600">Size: <span className="text-[#121212]">{selectedSize}</span></label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 text-xs font-bold uppercase tracking-wide rounded-sm border-2 transition-all ${selectedSize === size ? 'bg-[#121212] border-[#121212] text-white' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="flex items-center border border-stone-200 rounded-[4px] bg-white">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-14 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors" disabled={quantity <= 1}><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center text-sm font-bold text-[#121212]">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(displayStock, quantity + 1))} className="w-12 h-14 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors" disabled={quantity >= displayStock}><Plus className="w-4 h-4" /></button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className={`flex-1 h-14 font-black uppercase tracking-widest text-sm rounded-[4px] flex items-center justify-center gap-3 transition-all ${addedMessage ? 'bg-green-600 text-white' : 'bg-[#FE5733] hover:bg-[#e04825] text-white shadow-lg shadow-[#FE5733]/20 hover:shadow-xl'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addedMessage ? <><Check className="w-5 h-5" /> Added to Bag!</> : <><ShoppingBag className="w-5 h-5" /> Add to Bag</>}
            </button>
            <button onClick={() => toggleWishlist(product.id)} className={`w-14 h-14 flex items-center justify-center rounded-[4px] border-2 transition-all ${isLiked ? 'border-red-500 bg-red-50 text-red-500' : 'border-stone-200 hover:border-red-500 hover:text-red-500 text-stone-400'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {product.description && (
            <div className="prose prose-sm max-w-none text-stone-600 leading-relaxed border-t border-stone-100 pt-6">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>
      </div>

      <ProductReviews productId={product.id} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
