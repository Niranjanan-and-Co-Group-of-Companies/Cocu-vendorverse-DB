
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => { success: boolean; message: string };
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product.id);
        const moq = product.moq || 1;

        if (existingItem) {
          // If item already exists, just update its quantity
          const newQuantity = existingItem.quantity + moq;
          set({
            items: currentItems.map(item =>
              item.id === product.id ? { ...item, quantity: newQuantity } : item
            ),
          });
          return { success: true, message: `${moq} more "${product.name}" added to cart.` };
        } else {
          // Add new item with MOQ
          set({ items: [...currentItems, { ...product, quantity: moq }] });
          return { success: true, message: `"${product.name}" (x${moq}) added to cart.` };
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
          const moq = itemToUpdate?.moq || 1;

          if (quantity < moq) {
            // Optionally, prevent quantity from going below MOQ or handle as a business rule
            console.warn(`Attempted to set quantity for ${itemToUpdate?.name} below MOQ.`);
            return state; // Do not update if below MOQ
          }

          return {
            items: state.items.map(item =>
              item.id === productId ? { ...item, quantity: quantity } : item
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
