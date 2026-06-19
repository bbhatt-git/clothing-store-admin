import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedQuery(searchQuery); setIsSearching(false); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { if (searchQuery) setIsSearching(true); }, [searchQuery]);

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    product.slug.toLowerCase().includes(debouncedQuery.toLowerCase())
  ).slice(0, 6);

  const trendingSearches = ['Hoodies', 'Jackets', 'T-Shirts', 'Summer Collection', 'New Arrivals'];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 md:pt-32 px-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-6 border-b border-black/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-14 pl-12 pr-12 text-base border-0 outline-none text-[#121212] placeholder:text-stone-400 bg-stone-50 rounded-xl"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            {!searchQuery ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Trending</p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button key={term} onClick={() => setSearchQuery(term)} className="text-xs font-bold uppercase tracking-wide px-3 py-2 bg-stone-100 hover:bg-[#FE5733] hover:text-white rounded-sm transition-colors">
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : isSearching ? (
              <div className="text-center py-8 text-sm text-stone-400">Searching...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-sm text-stone-400">No products found for "{searchQuery}"</div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">{filteredProducts.length} results</p>
                {filteredProducts.map((product) => {
                  const price = product.sale_price || product.base_price;
                  return (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-xl transition-colors group"
                    >
                      <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                        <img src={product.images[0] || 'https://picsum.photos/seed/placeholder/200/300'} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#121212] truncate">{product.name}</p>
                        <p className="text-sm font-bold text-[#FE5733] mt-1">Rs {price.toLocaleString()}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#FE5733] transition-colors shrink-0" />
                    </Link>
                  );
                })}
                <Link href={`/shop?search=${encodeURIComponent(searchQuery)}`} onClick={onClose} className="block w-full text-center py-3 text-sm font-bold text-[#FE5733] hover:underline">
                  View all results for "{searchQuery}"
                </Link>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-black/5 shrink-0">
            <button onClick={onClose} className="w-full text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-[#121212] transition-colors">Close</button>
          </div>
        </div>
      </div>
    </>
  );
}
