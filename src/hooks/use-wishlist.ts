

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { getCategoryByName } from '@/lib/categories-service';
import { makePlain } from '@/lib/utils';
import type { PlainProduct } from '@/lib/products-service';

export interface WishlistItem extends PlainProduct {
    displayPrice?: DisplayPrice;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (product: Product) => Promise<{ success: boolean; message: string }>;
  removeItem: (productId: string) => { success: boolean; message: string };
  isItemInWishlist: (productId: string) => boolean;
}

export const useWishlist = create(
  persist<WishlistState>(
    (set, get) => ({
      items: [],
      addItem: async (product) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
          // Item is already in wishlist, so remove it
          const itemToRemove = currentItems[existingItemIndex];
          set({ items: currentItems.filter(item => item.id !== product.id) });
          return { success: true, message: `"${itemToRemove.name}" removed from your wishlist.` };
        } else {
          // Add item to wishlist after fetching its price
          const category = await getCategoryByName(product.category);
          const productInfo = {
                id: product.id,
                vendorSP: product.vendorSP,
                category: product.category,
                vendorId: product.vendorId,
                discountType: product.discountType,
                discountValue: product.discountValue,
                price: product.price,
                tieredPricing: product.tieredPricing
            };
          const displayPrice = await calculateDisplayPrice(productInfo, 'Personalized', category || undefined);
          const plainProduct = product as unknown as PlainProduct;
          set({ items: [...currentItems, { ...plainProduct, displayPrice }] });
          return { success: true, message: `"${product.name}" added to your wishlist.` };
        }
      },
      removeItem: (productId: string) => {
        const itemToRemove = get().items.find(p => p.id === productId);
        if (itemToRemove) {
          set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
          return { success: true, message: `"${itemToRemove.name}" removed from your wishlist.` };
        }
        return { success: false, message: 'Item not found in wishlist.' };
      },
      isItemInWishlist: (productId: string) => {
        return get().items.some(item => item.id === productId);
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
