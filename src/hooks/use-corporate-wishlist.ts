
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';

export interface WishlistItem extends Product {
    displayPrice?: DisplayPrice;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (product: Product) => Promise<{ success: boolean; message: string }>;
  removeItem: (productId: number) => { success: boolean; message: string };
  isItemInWishlist: (productId: number) => boolean;
}

export const useCorporateWishlist = create(
  persist<WishlistState>(
    (set, get) => ({
      items: [],
      addItem: async (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product.id);

        if (existingItem) {
          // Item is already in wishlist, so remove it
          set({ items: currentItems.filter(item => item.id !== product.id) });
          return { success: true, message: `"${product.name}" removed from your wishlist.` };
        } else {
          // Add item to wishlist
          const displayPrice = await calculateDisplayPrice(product, 'corporate');
          set({ items: [...currentItems, { ...product, displayPrice }] });
          return { success: true, message: `"${product.name}" added to your wishlist.` };
        }
      },
      removeItem: (productId) => {
        const itemToRemove = get().items.find(p => p.id === productId);
        if (itemToRemove) {
          set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
          return { success: true, message: `"${itemToRemove.name}" removed from your wishlist.` };
        }
        return { success: false, message: 'Item not found in wishlist.' };
      },
      isItemInWishlist: (productId: number) => {
        return get().items.some(item => item.id === productId);
      },
    }),
    {
      name: 'corporate-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
