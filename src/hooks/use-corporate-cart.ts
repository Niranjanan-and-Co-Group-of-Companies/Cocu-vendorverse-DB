
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCorporateCart = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          set({
            items: currentItems.map(item =>
              item.id === product.id ? { ...item, quantity: newQuantity } : item
            ),
          });
          return { success: true, message: `Added ${quantity} more of "${product.name}" to your cart.` };
        } else {
          set({ items: [...currentItems, { ...product, quantity: product.moq || quantity }] });
          return { success: true, message: `"${product.name}" (x${product.moq || quantity}) added to cart.` };
        }
      },
      removeItem: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set(state => {
          const itemToUpdate = state.items.find(item => item.id === productId);
          if (!itemToUpdate) return state;

          const minQty = itemToUpdate.moq || 1;
          const newQuantity = Math.max(minQty, quantity);

          return {
            items: state.items.map(item =>
              item.id === productId ? { ...item, quantity: newQuantity } : item
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'corporate-cart-storage', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);
