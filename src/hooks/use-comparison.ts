
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';

const MAX_COMPARE_ITEMS = 4;

interface ComparisonState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  clearAll: () => void;
}

export const useComparison = create(
  persist<ComparisonState>(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { toast } = useToast();
        const currentItems = get().items;

        if (currentItems.length >= MAX_COMPARE_ITEMS) {
          toast({
            title: 'Comparison Limit Reached',
            description: `You can only compare up to ${MAX_COMPARE_ITEMS} products at a time.`,
            variant: 'destructive',
          });
          return;
        }
        
        if (currentItems.some(item => item.id === product.id)) {
            // It's already there, no need to add again or show a toast
            return;
        }

        set({ items: [...currentItems, product] });
        toast({
          title: 'Added to Compare',
          description: `"${product.name}" has been added to your comparison list.`,
        });
      },
      removeItem: (productId) => {
        const itemToRemove = get().items.find(item => item.id === productId);
        if (itemToRemove) {
            const { toast } = useToast();
            toast({
                title: 'Removed from Compare',
                description: `"${itemToRemove.name}" has been removed from your comparison list.`,
                variant: 'destructive'
            });
        }
        set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
      },
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'product-comparison-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
