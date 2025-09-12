

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { getCategoryByName } from '@/lib/categories-service';
import { serializeProduct, type PlainProduct } from '@/lib/products-service';

export interface ComparisonItem extends PlainProduct {
    displayPrice?: DisplayPrice;
}

const MAX_COMPARE_ITEMS = 4;

interface ComparisonState {
  items: ComparisonItem[];
  addItem: (product: Product) => Promise<{ success: boolean, message?: string, variant?: 'destructive' }>;
  removeItem: (productId: string) => { success: boolean, message?: string, variant?: 'destructive' };
  clearAll: () => void;
}

export const useComparison = create(
  persist<ComparisonState>(
    (set, get) => ({
      items: [],
      addItem: async (product) => {
        const currentItems = get().items;

        if (currentItems.length >= MAX_COMPARE_ITEMS) {
          return {
            success: false,
            message: `You can only compare up to ${MAX_COMPARE_ITEMS} products at a time.`,
            variant: 'destructive',
          };
        }
        
        if (currentItems.some(item => item.id === product.id)) {
            return { success: false }; // Already in list, do nothing.
        }
        const category = await getCategoryByName(product.category);
        const productInfo = {
            id: product.id,
            vendorSP: product.vendorSP,
            category: product.category,
            vendorId: product.vendorId,
            discountType: product.discountType,
            discountValue: product.discountValue,
            price: product.price,
            tieredPricing: product.tieredPricing,
        };
        const displayPrice = await calculateDisplayPrice(productInfo, 'Corporate', category || undefined);
        const plainProduct = await serializeProduct(product);
        set({ items: [...currentItems, { ...plainProduct, displayPrice }] });

        return {
            success: true,
            message: `"${product.name}" has been added to your comparison list.`
        };
      },
      removeItem: (productId) => {
        const itemToRemove = get().items.find(item => item.id === productId);
        if (itemToRemove) {
            set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
            return {
                success: true,
                message: `"${itemToRemove.name}" has been removed from your comparison list.`,
                variant: 'destructive'
            }
        }
        return { success: false };
      },
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'product-comparison-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
