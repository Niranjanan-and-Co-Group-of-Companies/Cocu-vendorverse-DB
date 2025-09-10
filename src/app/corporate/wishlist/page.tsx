
'use client';

import * as React from 'react';
import { useCorporateWishlist } from '@/hooks/use-corporate-wishlist';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { CorporateProductCard } from '@/components/corporate/corporate-product-card';

export default function CorporateWishlistPage() {
  const { items } = useCorporateWishlist();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Wishlist</h1>
        <p className="text-muted-foreground mt-2">
          Your saved items for future consideration.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <CorporateProductCard 
              key={item.id} 
              product={item} 
              onAction={() => {}} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-24">
            <Heart className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Your wishlist is empty.</h3>
            <p className="max-w-md">Start exploring products and click the heart icon to save your favorites for later.</p>
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
