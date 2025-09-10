
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { getCategoryByName } from '@/lib/categories-service';


export interface CartItem extends Product {
  quantity: number;
  displayPrice?: DisplayPrice;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => Promise<{ success: boolean; message: string }>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
}

const updateItemPrice = async (item: Product, quantity: number): Promise<DisplayPrice | undefined> => {
    const category = await getCategoryByName(item.category);
    const productInfo = {
        id: item.id,
        vendorSP: item.vendorSP, // CORRECT: Use the numeric vendorSP directly
        category: item.category,
        vendorId: item.vendorId,
        tieredPricing: item.tieredPricing,
        price: item.price,
    };
    return calculateDisplayPrice(productInfo, 'Corporate', category || undefined, quantity);
}

export const useCorporateCart = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      addItem: async (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          await get().updateQuantity(product.id, newQuantity);
          return { success: true, message: `Added ${quantity} more of "${product.name}" to your cart.` };
        } else {
          const newQuantity = product.moq || quantity;
          const displayPrice = await updateItemPrice(product, newQuantity);
          set({ items: [...currentItems, { ...product, quantity: newQuantity, displayPrice }] });
          return { success: true, message: `"${product.name}" (x${newQuantity}) added to cart.` };
        }
      },
      removeItem: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== productId),
        }));
      },
      updateQuantity: async (productId, quantity) => {
        const itemToUpdate = get().items.find(item => item.id === productId);
        if (!itemToUpdate) return;
        
        const minQty = itemToUpdate.moq || 1;
        const newQuantity = Math.max(minQty, quantity);

        const displayPrice = await updateItemPrice(itemToUpdate, newQuantity);
        
        set(state => ({
            items: state.items.map(item =>
              item.id === productId ? { ...item, quantity: newQuantity, displayPrice } : item
            ),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'corporate-cart-storage', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);
