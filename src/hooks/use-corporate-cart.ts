
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { getCategoryByName } from '@/lib/categories-service';
import { makePlain } from '@/lib/utils';
import type { PlainProduct } from '@/lib/products-service';
import { serializeProduct } from '@/lib/products-service';

export interface CartItem extends PlainProduct {
  quantity: number;
  displayPrice?: DisplayPrice;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => Promise<{ success: boolean; message: string; variant?: 'destructive' }>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
}

const updateItemPrice = async (item: Product, quantity: number): Promise<DisplayPrice | undefined> => {
    const category = await getCategoryByName(item.category);
    
    let vendorSP = item.vendorSP;
    if (item.tieredPricing && item.tieredPricing.length > 0) {
        const sortedTiers = [...item.tieredPricing].sort((a, b) => b.quantity - a.quantity);
        const applicableTier = sortedTiers.find(tier => quantity >= tier.quantity);
        if (applicableTier && applicableTier.price) {
            const tierPrice = parseFloat(applicableTier.price.replace(/[₹$,]/g, ''));
            if (!isNaN(tierPrice)) {
                 vendorSP = tierPrice;
            }
        }
    }
    
    const productInfo = {
        id: item.id,
        vendorSP: vendorSP,
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
        const newQuantity = Math.max(product.moq || 1, quantity);
        
        if (product.stock < newQuantity) {
            return { success: false, message: "Not enough stock available for the requested quantity.", variant: 'destructive'};
        }

        const plainProduct = makePlain(await serializeProduct(product));

        if (existingItem) {
          const updatedQuantity = existingItem.quantity + newQuantity;
          if (product.stock < updatedQuantity) {
             return { success: false, message: "Adding this quantity would exceed available stock.", variant: 'destructive'};
          }
          await get().updateQuantity(product.id, updatedQuantity);
          return { success: true, message: `Added ${newQuantity} more of "${product.name}" to your cart.` };
        } else {
          const displayPrice = await updateItemPrice(product, newQuantity);
          set({ items: [...currentItems, { ...plainProduct, quantity: newQuantity, displayPrice }] });
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
