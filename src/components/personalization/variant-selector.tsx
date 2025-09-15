
'use client';

import * as React from 'react';
import type { Product, ProductVariant } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCustomization } from '@/hooks/use-customization';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface VariantSelectorProps {
  product: Product;
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const { selectedVariantId, setSelectedVariantId } = useCustomization();

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Color: <span className="text-muted-foreground">{product.variants.find(v => v.id === selectedVariantId)?.colorName}</span></h3>
      <div className="flex flex-wrap gap-2">
        {product.variants.map(variant => (
          <Button
            key={variant.id}
            variant="outline"
            size="icon"
            className={cn(
                'h-10 w-10 rounded-full border-2', 
                selectedVariantId === variant.id && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{ backgroundColor: variant.colorHex }}
            onClick={() => setSelectedVariantId(variant.id)}
            aria-label={`Select color ${variant.colorName}`}
          >
             {variant.image && (
                <Image 
                    src={variant.image}
                    alt={variant.colorName}
                    fill
                    className="object-cover rounded-full"
                />
             )}
          </Button>
        ))}
      </div>
    </div>
  );
}
