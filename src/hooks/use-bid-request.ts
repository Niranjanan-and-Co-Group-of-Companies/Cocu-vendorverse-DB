
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';

const MAX_ITEMS = 4;

interface BidRequestState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  clearBid: () => void;
}

export const useBidRequest = create(
  persist<BidRequestState>(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { toast } = useToast();
        const currentItems = get().items;

        if (currentItems.length >= MAX_ITEMS) {
          toast({
            title: 'Bid Limit Reached',
            description: `You can only add up to ${MAX_ITEMS} products to a single bid request.`,
            variant: 'destructive',
          });
          return;
        }

        if (currentItems.length > 0 && currentItems[0].category !== product.category) {
          toast({
            title: 'Category Mismatch',
            description: 'All products in a bid request must belong to the same category.',
            variant: 'destructive',
          });
          return;
        }

        set({ items: [...currentItems, product] });
        toast({
          title: 'Product Added to Bid',
          description: `"${product.name}" has been added to your bid request.`,
        });
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
