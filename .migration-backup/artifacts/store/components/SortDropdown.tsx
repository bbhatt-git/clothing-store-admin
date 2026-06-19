'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const options = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function SortDropdown({ 
  currentSort, 
  onChange 
}: { 
  currentSort: string; 
  onChange?: (val: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange(val);
      setIsOpen(false);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'popularity') {
      params.delete('sort');
    } else {
      params.set('sort', val);
    }
    setIsOpen(false);
    // Delete any showFilters parameter when resetting
    params.delete('showFilters');
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const currentLabel = options.find((o) => o.value === currentSort || (currentSort === '' && o.value === 'popularity'))?.label || 'Popularity';

  return (
    <div className="relative inline-block text-left flex-none" ref={dropdownRef} id="shop-sort-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 h-10 bg-white border border-zinc-100 hover:border-zinc-200 rounded-full text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-all cursor-pointer shadow-sm select-none"
        type="button"
        aria-label="Sort products"
        aria-expanded={isOpen}
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
        <span>Sort by <strong className="text-zinc-900 font-extrabold">{currentLabel}</strong></span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 bg-white border border-zinc-150 rounded-2xl shadow-xl z-40 overflow-hidden"
          >
            <div className="p-1.5 space-y-1">
              {options.map((opt) => {
                const isSelected = currentSort === opt.value || (currentSort === '' && opt.value === 'popularity');
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white font-bold'
                        : 'hover:bg-zinc-50 text-zinc-650 hover:text-zinc-950'
                    }`}
                    aria-label={`Sort by ${opt.label}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
