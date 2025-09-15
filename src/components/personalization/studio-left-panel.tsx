
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SideSelector } from './side-selector';
import { VariantSelector } from './variant-selector';

interface StudioLeftPanelProps {
  product: Product;
}

export function StudioLeftPanel({ product }: StudioLeftPanelProps) {
  return (
    <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-sm text-muted-foreground">by {product.vendor}</p>
            </div>
            
            <Separator />
            
            {product.hasVariants && product.variants.length > 1 && (
              <>
                <VariantSelector product={product} />
                <Separator />
              </>
            )}

            <SideSelector product={product} />

            <Separator />

            <div>
                <h3 className="font-semibold mb-3">Total Price</h3>
                <p className="text-3xl font-bold">{product.price}</p>
                 <div className="mt-4 space-y-2">
                    <Button className="w-full">Add to Cart</Button>
                    <Button variant="secondary" className="w-full">Buy Now</Button>
                 </div>
            </div>
        </div>
    </ScrollArea>
  );
}
