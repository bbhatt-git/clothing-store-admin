'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { Home, ShoppingBag, Heart, ShoppingCart, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import CartSidebar from '@/components/CartSidebar';

export default function MobileDock() {
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalCartItems = useCart((state) => state.getTotalItems());
  const totalWishItems = useWishlist((state) => state.itemIds.length);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    { label: 'Orders', path: '/orders', icon: ClipboardList },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: totalWishItems },
    { label: 'Cart', path: '/cart', icon: ShoppingCart, badge: totalCartItems, isCart: true },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        className="bg-[#121212]/95 backdrop-blur-md border border-white/20 px-4 py-3 rounded-full flex items-center justify-between w-full max-w-md shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            item.isCart ? (
              <button
                key="cart"
                onClick={() => setIsCartOpen(true)}
                className="relative flex flex-col items-center justify-center py-1 px-3 rounded-full text-center group cursor-pointer transition-transform active:scale-90"
                aria-label="Open cart"
              >
                {/* Highlight background pill */}
                {isActive && (
                  <motion.span 
                    layoutId="activeDockBubble"
                    className="absolute inset-0 bg-[#FE5733] rounded-full z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center space-y-0.5">
                  <Icon 
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-white'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Badge count */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#FE5733] text-white text-[8px] font-bold font-mono h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-[#121212]">
                      {item.badge}
                    </span>
                  )}

                  <span 
                    className={`text-[8px] font-bold tracking-wider uppercase transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-stone-400/80 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            ) : (
              <Link 
                key={item.path} 
                href={item.path} 
                className="relative flex flex-col items-center justify-center py-1 px-3 rounded-full text-center group cursor-pointer transition-transform active:scale-90"
              >
                {/* Highlight background pill */}
                {isActive && (
                  <motion.span 
                    layoutId="activeDockBubble"
                    className="absolute inset-0 bg-[#FE5733] rounded-full z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center space-y-0.5">
                  <Icon 
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-white'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Badge count */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#FE5733] text-white text-[8px] font-bold font-mono h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-[#121212]">
                      {item.badge}
                    </span>
                  )}

                  <span 
                    className={`text-[8px] font-bold tracking-wider uppercase transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-stone-400/80 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          );
        })}
      </motion.div>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
