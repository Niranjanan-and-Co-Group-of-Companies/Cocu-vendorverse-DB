
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';

const MAX_ITEMS = 4;

type BidItem = Product & { isOutOfStock?: boolean };

interface BidRequestState {
  items: BidItem[];
  addItem: (product: Product) => { success: boolean, message?: string, variant?: 'destructive' };
  removeItem: (productId: string) => void;
  setStockStatus: (productId: string, isOutOfStock: boolean) => void;
  clearBid: () => void;
}

export const useBidRequest = create(
  persist<BidRequestState>(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;

        if (product.stock < (product.moq || 1)) {
            return {
                success: false,
                message: "This product is out of stock and cannot be added to a bid.",
                variant: 'destructive',
            };
        }

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
        
        if (currentItems.some(item => item.id === product.id)) {
            return {
                success: false,
                message: "This product is already in your bid request.",
            };
        }

        set({ items: [...currentItems, { ...product, isOutOfStock: false }] });
        return {
            success: true,
            message: `"${product.name}" has been added to your bid request.`
        };
      },
      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
      },
      setStockStatus: (productId, isOutOfStock) => {
        set(state => ({
            items: state.items.map(item => 
                item.id === productId ? { ...item, isOutOfStock } : item
            )
        }));
      },
      clearBid: () => set({ items: [] }),
    }),
    {
      name: 'bid-request-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
