
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/lib/products';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { getCategoryByName } from '@/lib/categories-service';
import type { PlainProduct } from '@/lib/products-service';
import { serializeProduct } from '@/lib/products-service';
import { makePlain } from '@/lib/utils';

export interface CartItem extends PlainProduct {
  cartItemId: string; // Unique ID for this specific item in the cart (product.id + variant.id)
  quantity: number;
  displayPrice?: DisplayPrice;
  selectedVariant: ProductVariant | null;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedVariant?: ProductVariant | null) => Promise<{ success: boolean; message: string }>;
  removeItem: (cartItemId: string) => { success: boolean; message: string };
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      addItem: async (product, quantity = 1, selectedVariant = null) => {
        const category = await getCategoryByName(product.category);
        const displayPrice = await calculateDisplayPrice({ id: product.id, vendorId: product.vendorId, vendorSP: product.vendorSP, category: product.category, discountType: product.discountValue }, 'Personalized', category || undefined);
        const currentItems = get().items;
        
        const variantId = product.hasVariants && selectedVariant ? selectedVariant.id : 'default';
        const cartItemId = `${product.id}-${variantId}`;
        
        const existingItem = currentItems.find(item => item.cartItemId === cartItemId);

        const plainProduct = makePlain(await serializeProduct(product));

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          set({
            items: currentItems.map(item =>
              item.cartItemId === cartItemId ? { ...item, quantity: newQuantity, displayPrice } : item
            ),
          });
          return { success: true, message: `Added ${quantity} more of "${product.name}" to your cart.` };
        } else {
          set({ items: [...currentItems, { ...(plainProduct as unknown as PlainProduct), cartItemId, quantity: quantity, displayPrice, selectedVariant }] });
          return { success: true, message: `"${product.name}" (x${quantity}) added to cart.` };
        }
      },
      removeItem: (cartItemId) => {
        const itemToRemove = get().items.find(item => item.cartItemId === cartItemId);
        if (itemToRemove) {
            set(state => ({
                items: state.items.filter(item => item.cartItemId !== cartItemId),
            }));
            return { success: true, message: `"${itemToRemove.name}" removed from cart.` };
        }
        return { success: false, message: 'Item not found.' };
      },
      updateQuantity: (cartItemId, quantity) => {
        set(state => {
          const itemToUpdate = state.items.find(item => item.cartItemId === cartItemId);
          if (!itemToUpdate) return state;

          const maxQty = itemToUpdate.maxQuantityPerOrder || itemToUpdate.stock;
          const newQuantity = Math.max(1, Math.min(quantity, maxQty));

          return {
            items: state.items.map(item =>
              item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'personal-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
