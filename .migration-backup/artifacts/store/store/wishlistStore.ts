import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistState {
  itemIds: string[];
  toggleWishlist: (productId: string) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      itemIds: [],
      toggleWishlist: (productId) => {
        const ids = get().itemIds;
        if (ids.includes(productId)) {
          set({ itemIds: ids.filter((id) => id !== productId) });
        } else {
          set({ itemIds: [...ids, productId] });
        }
      },
      hasItem: (productId) => get().itemIds.includes(productId),
    }),
    {
      name: 'tsz-wishlist-storage', // unique key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
