import React, { useState, useEffect, useTransition, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import PriceSliderClient from '@/components/PriceSliderClient';
import SearchOverlay from '@/components/SearchOverlay';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

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

interface ShopClientProps {
  initialProducts: Product[];
  initialCategory?: string;
  initialSize?: string;
  initialColor?: string;
  initialSearch?: string;
}

export default function ShopClient({ initialProducts, initialCategory, initialSize, initialColor, initialSearch }: ShopClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory ? (initialProducts.flatMap(p => p.categories).find(c => c.toLowerCase() === initialCategory.toLowerCase()) || 'All') : 'All'
  );
  const [selectedSize, setSelectedSize] = useState(
    initialSize ? (initialProducts.flatMap(p => p.sizes).find(s => s.toLowerCase() === initialSize.toLowerCase()) || 'All') : 'All'
  );
  const [selectedColor, setSelectedColor] = useState(
    initialColor ? (initialProducts.flatMap(p => p.colors).find(c => c.toLowerCase() === initialColor.toLowerCase()) || 'All') : 'All'
  );

  const categories = ['All', ...Array.from(new Set(initialProducts.flatMap(p => p.categories)))];
  const allSizes = ['All', ...Array.from(new Set(initialProducts.flatMap(p => p.sizes)))];
  const allColors = ['All', ...Array.from(new Set(initialProducts.flatMap(p => p.colors)))];

  const prices = initialProducts.map(p => p.sale_price || p.base_price);
  const highestPriceInStore = initialProducts.length > 0 ? Math.max(...prices) + 2000 : 10000;

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(highestPriceInStore);
  const [sortBy, setSortBy] = useState('latest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const productsPerPage = 12;

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) setIsFiltering(true); });
    const timer = setTimeout(() => { if (active) setIsFiltering(false); }, 450);
    return () => { active = false; clearTimeout(timer); };
  }, [searchTerm, selectedCategory, selectedSize, selectedColor, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sort-dropdown') && !target.closest('.sort-dropdown-button')) setIsSortDropdownOpen(false);
    };
    if (isSortDropdownOpen) { document.addEventListener('click', handleClickOutside); return () => document.removeEventListener('click', handleClickOutside); }
  }, [isSortDropdownOpen]);

  const filterKey = `${searchTerm}-${selectedCategory}-${selectedSize}-${selectedColor}-${minPrice}-${maxPrice}-${sortBy}`;
  useEffect(() => { setCurrentPage(1); }, [filterKey]);

  const filteredProducts = initialProducts.filter((product) => {
    const price = product.sale_price || product.base_price;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.categories.includes(selectedCategory);
    const matchesSize = selectedSize === 'All' || product.sizes.includes(selectedSize);
    const matchesColor = selectedColor === 'All' || product.colors.includes(selectedColor);
    const matchesPrice = price >= minPrice && price <= maxPrice;
    return matchesSearch && matchesCategory && matchesSize && matchesColor && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.sale_price || a.base_price;
    const priceB = b.sale_price || b.base_price;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return b.rating_avg - a.rating_avg;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const resetFilters = () => {
    setSearchTerm(''); setSelectedCategory('All'); setSelectedSize('All');
    setSelectedColor('All'); setMinPrice(0); setMaxPrice(highestPriceInStore); setSortBy('latest');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div className="lg:hidden flex items-center gap-2 bg-white p-3 rounded-[4px] border border-[#121212]/5 shadow-sm">
        <button onClick={() => setIsMobileFilterOpen(true)} className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider bg-[#121212] text-white px-3 py-2 rounded-sm hover:bg-[#FE5733] transition-colors flex-1">
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>
        <div className="relative flex-1">
          <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="sort-dropdown-button w-full flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider bg-[#F5F5F0]/50 border border-[#121212]/10 px-3 py-2 rounded-sm hover:border-[#FE5733] transition-colors text-[#121212]">
            <span>{sortBy === 'latest' ? 'New' : sortBy === 'price-low' ? 'Price: Low' : sortBy === 'price-high' ? 'Price: High' : 'Top Rated'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isSortDropdownOpen && (
            <div className="sort-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-[#121212]/10 rounded-sm shadow-lg z-50">
              {[{ value: 'latest', label: 'New' }, { value: 'price-low', label: 'Price: Low' }, { value: 'price-high', label: 'Price: High' }, { value: 'rating', label: 'Top Rated' }].map((o) => (
                <button key={o.value} onClick={() => { setSortBy(o.value); setIsSortDropdownOpen(false); }} className={`w-full text-left text-xs font-bold uppercase tracking-wider px-3 py-2 hover:bg-[#F5F5F0]/50 ${sortBy === o.value ? 'text-[#FE5733]' : 'text-[#121212]'}`}>{o.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isMobileFilterOpen && <div className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />}

      <div className={`fixed top-0 bottom-0 left-0 z-[70] w-4/5 max-w-[320px] bg-white overflow-y-auto shadow-2xl p-6 pt-20 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:translate-x-0 lg:w-full lg:max-w-none lg:h-auto lg:overflow-visible lg:shadow-sm lg:p-6 lg:pt-6 lg:rounded-[4px] lg:border lg:border-[#121212]/5 lg:bg-white lg:z-0 lg:col-span-3 space-y-8 ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between pb-4 border-b border-[#121212]/5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#FE5733]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#121212]">Filter Catalogs</h3>
          </div>
          <button className="lg:hidden p-2 -mr-2 text-stone-400 hover:text-[#121212]" onClick={() => setIsMobileFilterOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700">Search Keywords</label>
          <div className="relative">
            <div className="cursor-pointer" onClick={() => setIsSearchOpen(true)}>
              <input type="text" placeholder="e.g. Hoodie, Dress, Jacket..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setIsSearchOpen(true)} className="w-full text-xs h-10 bg-stone-50 border border-stone-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-[4px] pl-10 pr-4 outline-none text-[#121212] placeholder:text-stone-400 font-medium transition-all cursor-pointer" readOnly />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700">Collection / Category</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm transition-all border cursor-pointer whitespace-nowrap ${selectedCategory === cat ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-95' : 'bg-white border-stone-300 hover:border-zinc-400 hover:text-zinc-900 text-stone-800'}`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700">Sizing Filter</label>
          <div className="flex flex-wrap gap-1.5">
            {allSizes.map((sz) => (
              <button key={sz} onClick={() => setSelectedSize(sz)} className={`min-w-10 h-10 text-[10px] font-bold tracking-wide rounded-sm transition-all border cursor-pointer ${selectedSize === sz ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-95' : 'bg-white border-stone-300 hover:border-zinc-400 text-stone-800'}`}>{sz}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700">Colorways</label>
          <div className="flex flex-wrap gap-1.5">
            {allColors.map((col) => (
              <button key={col} onClick={() => setSelectedColor(col)} className={`text-[10px] font-bold tracking-wide px-3 py-2 rounded-sm transition-all border cursor-pointer whitespace-nowrap ${selectedColor === col ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-95' : 'bg-white border-stone-300 hover:border-zinc-400 text-stone-800'}`}>{col}</button>
            ))}
          </div>
        </div>

        <PriceSliderClient min={0} max={highestPriceInStore} onChange={(min, max) => { setMinPrice(min); setMaxPrice(max); }} />

        <button onClick={resetFilters} className="w-full text-center py-3 border border-[#FE5733]/20 text-[#FE5733] hover:bg-[#FE5733] hover:text-white transition-all duration-300 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer">
          Reset All Filters
        </button>
      </div>

      <div className="lg:col-span-9 space-y-6">
        <div className="hidden lg:flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-[4px] border border-[#121212]/5 shadow-sm gap-4">
          <p className="text-xs font-mono font-bold text-[#121212]/60">
            SHOWING {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, sortedProducts.length)} OF {sortedProducts.length} PRODUCTS
          </p>
          <div className="relative">
            <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="sort-dropdown-button flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-[#F5F5F0]/50 border border-[#121212]/10 px-3 py-2 rounded-sm hover:border-[#FE5733] transition-colors text-[#121212]">
              Sort By <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortDropdownOpen && (
              <div className="sort-dropdown absolute top-full right-0 mt-1 bg-white border border-[#121212]/10 rounded-sm shadow-lg z-50 min-w-[180px]">
                {[{ value: 'latest', label: 'New Arrivals' }, { value: 'price-low', label: 'Price: Low to High' }, { value: 'price-high', label: 'Price: High to Low' }, { value: 'rating', label: 'Top Rated' }].map((o) => (
                  <button key={o.value} onClick={() => { setSortBy(o.value); setIsSortDropdownOpen(false); }} className={`w-full text-left text-xs font-bold uppercase tracking-wider px-3 py-2 hover:bg-[#F5F5F0]/50 ${sortBy === o.value ? 'text-[#FE5733]' : 'text-[#121212]'}`}>{o.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isFiltering ? (
          <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-[#121212]/5 p-4 rounded-[4px] bg-white space-y-4 animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 rounded-[4px] w-full" />
                <div className="h-3.5 bg-neutral-200 rounded-[4px] w-1/3" />
                <div className="h-4 bg-neutral-200 rounded-[4px] w-4/5" />
                <div className="h-3 bg-neutral-200 rounded-[4px] w-1/2" />
              </div>
            ))}
          </div>
        ) : currentProducts.length > 0 ? (
          <div className="grid gap-3 md:gap-6 transition-all duration-300 grid-cols-2 lg:grid-cols-4">
            {currentProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[4px] border border-[#121212]/5">
            <SlidersHorizontal className="w-10 h-10 text-[#121212]/20 mx-auto mb-4" />
            <h4 className="text-lg font-bold uppercase tracking-tight text-[#121212]">No Products Matched</h4>
            <p className="text-xs text-[#121212]/50 mt-1 max-w-sm mx-auto leading-relaxed">We couldn&apos;t find any items matching your current filters. Try relaxing your filters.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#121212]/10 rounded-sm hover:bg-[#121212] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${currentPage === page ? 'bg-[#121212] text-white' : 'bg-[#F5F5F0]/50 text-[#121212] hover:bg-[#121212] hover:text-white'}`}>{page}</button>
              ))}
            </div>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#121212]/10 rounded-sm hover:bg-[#121212] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        )}
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => { setIsSearchOpen(false); }} allProducts={initialProducts} />
    </div>
  );
}
