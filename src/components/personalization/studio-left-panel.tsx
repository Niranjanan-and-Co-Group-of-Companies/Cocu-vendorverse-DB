
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SideSelector } from './side-selector';
import { VariantSelector } from './variant-selector';
import { MobileActionButtons } from './mobile-action-buttons';

interface StudioLeftPanelProps {
  product: Product;
}

export function StudioLeftPanel({ product }: StudioLeftPanelProps) {
  const showVariants = product.hasVariants && product.variants && product.variants.length > 1;

  return (
    <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-sm text-muted-foreground">by {product.vendor}</p>
            </div>
            
            <Separator />
            
            {showVariants && (
              <>
                <VariantSelector product={product} />
                <Separator />
              </>
            )}

            <SideSelector product={product} />

            <Separator />

            <MobileActionButtons product={product} />
        </div>
    </ScrollArea>
  );
}
