import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  imageUrl: string;
  size: string;
  color: string;
  colorHex?: string;
  quantity: number;
  unitPrice: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
        );

        if (existingIndex > -1) {
          const updatedItems = [...items];
          const newQty = updatedItems[existingIndex].quantity + newItem.quantity;
          updatedItems[existingIndex].quantity = Math.min(newQty, newItem.maxStock);
          set({ items: updatedItems });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        });
      },
      updateQuantity: (productId, variantId, quantity) => {
        const items = get().items;
        if (quantity <= 0) {
          // Remove item if quantity hits 0
          set({ items: items.filter((item) => !(item.productId === productId && item.variantId === variantId)) });
          return;
        }
        const updatedItems = items.map((item) => {
          if (item.productId === productId && item.variantId === variantId) {
            return { ...item, quantity: Math.min(Math.max(1, quantity), item.maxStock) };
          }
          return item;
        });
        set({ items: updatedItems });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    }),
    {
      name: 'tsz-cart-storage', // unique key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
