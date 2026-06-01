'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { ShoppingBag, Heart, Menu, X } from 'lucide-react';
import CartSidebar from '@/components/CartSidebar';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const totalCartItems = useCart((state) => state.getTotalItems());
  const totalWishItems = useWishlist((state) => state.itemIds.length);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return false; // Never show active state for home page
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/orders', label: 'Orders' },
    { href: '/about', label: 'Our Story' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#121212]/10 shadow-sm">
      <nav className="max-w-[1560px] mx-auto px-6 md:px-10 h-16 grid grid-cols-3 items-center">
        
        {/* Left: Mobile Menu Toggle / Desktop Links */}
        <div className="flex items-center justify-start">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`md:hidden flex items-center justify-center p-2 -ml-2 rounded-sm transition-all duration-300 ${
              isOpen 
                ? 'text-[#FE5733] bg-[#FE5733]/10' 
                : 'text-[#121212] hover:text-[#FE5733] hover:bg-[#FE5733]/5'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-6 h-6 stroke-[2]" /> : <Menu className="w-6 h-6 stroke-[2]" />}
          </button>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-xs font-bold uppercase tracking-widest transition-all duration-300 py-2 px-3 rounded-sm group whitespace-nowrap ${
                  isActive(link.href)
                    ? 'text-[#FE5733]'
                    : 'text-[#121212] hover:text-[#FE5733]'
                }`}
                aria-label={`Navigate to ${link.label}`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FE5733] transition-all duration-300 group-hover:w-full"></span>
                )}
                {!isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FE5733] transition-all duration-300 group-hover:w-full"></span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Center: Brand Logo */}
        <div className="flex items-center justify-center">
          <Link 
            href="/" 
            className={`inline-block flex items-center justify-center transition-all duration-300 ${
              isActive('/') 
                ? 'opacity-80' 
                : 'hover:opacity-80'
            }`}
            aria-label="Go to Home Page"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="The Style Zone Logo" 
              className="h-7 md:h-8 w-auto object-contain transition-opacity duration-300"
            />
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end gap-4">
          <Link 
            href="/wishlist" 
            className={`relative group flex items-center p-2 -mr-2 md:mr-0 rounded-sm transition-all duration-300 ${
              isActive('/wishlist') 
                ? 'text-red-600 bg-red-50' 
                : 'text-[#121212] hover:text-red-600'
            }`} 
            aria-label="View Wishlist"
          >
            <Heart className={`w-5 h-5 stroke-[2] transition-all duration-300 ${isActive('/wishlist') ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
            {isMounted && totalWishItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FE5733] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {totalWishItems}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative group flex items-center p-2 -mr-2 md:mr-0 rounded-sm transition-all duration-300 hidden md:flex ${
              isCartOpen
                ? 'text-red-600 bg-red-50'
                : 'text-[#121212] hover:text-red-600'
            }`}
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className={`w-5 h-5 stroke-[2] transition-all duration-300 ${isCartOpen ? 'scale-110' : 'group-hover:scale-110'}`} />
            {isMounted && totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#121212] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-[#121212]/10 flex flex-col p-6 space-y-4 shadow-xl z-40 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`relative text-sm font-bold uppercase tracking-widest transition-all duration-300 py-3 px-4 rounded-sm border-2 group whitespace-nowrap ${
                isActive(link.href)
                  ? 'text-[#FE5733] border-[#FE5733] bg-[#FE5733]/5'
                  : 'text-[#121212] border-transparent hover:border-[#FE5733]/30 hover:bg-[#FE5733]/5'
              }`}
              aria-label={`Navigate to ${link.label}`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FE5733] transition-all duration-300 group-hover:w-full"></span>
              )}
              {!isActive(link.href) && (
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FE5733] transition-all duration-300 group-hover:w-full"></span>
              )}
            </Link>
          ))}
        </div>
      )}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
