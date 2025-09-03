
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';

const MAX_ITEMS = 4;

interface BidRequestState {
  items: Product[];
  addItem: (product: Product) => { success: boolean, message?: string, variant?: 'destructive' };
  removeItem: (productId: number) => void;
  clearBid: () => void;
}

export const useBidRequest = create(
  persist<BidRequestState>(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;

        if (currentItems.length >= MAX_ITEMS) {
          return {
            success: false,
            message: `You can only add up to ${MAX_ITEMS} products to a single bid request.`,
            variant: 'destructive',
          };
        }

        if (currentItems.length > 0 && currentItems[0].category !== product.category) {
          return {
            success: false,
            message: 'All products in a bid request must belong to the same category.',
            variant: 'destructive',
          };
        }

        set({ items: [...currentItems, product] });
        return {
            success: true,
            message: `"${product.name}" has been added to your bid request.`
        };
      },
      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
      },
      clearBid: () => set({ items: [] }),
    }),
    {
      name: 'bid-request-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
