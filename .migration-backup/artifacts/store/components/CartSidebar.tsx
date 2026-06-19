'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/store/cartStore';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[95] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
         style={{ touchAction: 'pan-y' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FE5733]" />
            <h2 className="text-lg font-bold text-[#121212] uppercase tracking-wider">Your Bag</h2>
            <span className="bg-[#FE5733] text-white text-xs font-bold px-2 py-1 rounded-full">{totalItems}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4"
             style={{ 
               WebkitOverflowScrolling: 'touch',
               msOverflowStyle: 'none',
               scrollbarWidth: 'auto'
             }}
        >
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-sm font-medium text-stone-500">Your bag is empty</p>
              <Link 
                href="/shop" 
                onClick={onClose}
                className="inline-block mt-4 text-xs font-bold text-[#FE5733] hover:underline"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="flex gap-4 p-4 bg-stone-50 rounded-[4px] border border-stone-200">
                <div className="w-20 h-24 bg-white rounded-[4px] overflow-hidden shrink-0 border border-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#121212] line-clamp-2">{item.name}</p>
                  <p className="text-xs text-stone-500 mt-1">Size: {item.size} | Color: {item.color}</p>
                  <p className="text-sm font-bold text-[#FE5733] mt-2">Rs {item.unitPrice.toLocaleString()}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center border border-stone-200 rounded-[4px] bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#121212]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-6 space-y-4 shrink-0">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Subtotal</span>
              <span className="font-bold text-[#121212]">Rs {totalPrice.toLocaleString()}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full bg-[#FE5733] hover:bg-[#e04825] text-white rounded-[4px] font-bold h-12 text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                clearCart();
                onClose();
              }}
              className="w-full text-xs font-bold text-stone-500 hover:text-red-500 transition-colors"
            >
              Clear Bag
            </button>
          </div>
        )}
      </div>
    </>
  );
}
