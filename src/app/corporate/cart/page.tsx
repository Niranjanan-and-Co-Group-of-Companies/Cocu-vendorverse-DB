
'use client';

import * as React from 'react';
import { useCorporateCart } from '@/hooks/use-corporate-cart';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { CartItem } from '@/components/corporate/cart/cart-item';
import { CartSummary } from '@/components/corporate/cart/cart-summary';

export default function CorporateCartPage() {
  const { items } = useCorporateCart();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Cart</h1>
        <p className="text-muted-foreground mt-2">
          Review your items, update quantities, and proceed to checkout.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
                {items.map(item => (
                    <CartItem key={item.id} item={item} />
                ))}
            </div>
            <div className="lg:sticky top-20">
                <CartSummary items={items} />
            </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-24">
            <ShoppingBag className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Your cart is empty.</h3>
            <p className="max-w-md">Looks like you haven't added any products to your cart yet. Start browsing to find the perfect corporate gifts.</p>
             <Button asChild className="mt-4">
                <Link href="/corporate/products">
                    Browse Products
                </Link>
             </Button>
        </div>
      )}
    </div>
  );
}
