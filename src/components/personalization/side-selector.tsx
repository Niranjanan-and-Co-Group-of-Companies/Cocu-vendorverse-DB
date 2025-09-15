
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useCustomization } from '@/hooks/use-customization';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';

interface SideSelectorProps {
  product: Product;
}

export function SideSelector({ product }: SideSelectorProps) {
  const { activeSide, setActiveSide, selectedVariantId } = useCustomization();
  const [isOpen, setIsOpen] = React.useState(true)

  const activeVariant = product.variants.find(v => v.id === selectedVariantId);
  const sidesData = activeVariant?.customizationSides || {};

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Product Sides</h3>
        <CollapsibleTrigger asChild>
          <button>
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="grid grid-cols-3 gap-2">
        {Object.entries(sidesData).map(([side, data]) => {
          if (!data?.image) return null;
          const isActive = side === activeSide;
          return (
            <button 
              key={side} 
              className="relative aspect-square rounded-md border-2 overflow-hidden border-transparent data-[active=true]:border-primary"
              data-active={isActive}
              onClick={() => setActiveSide(side as any)}
            >
              <Image src={data.image} alt={side} fill className="object-cover" />
              {isActive && (
                <div className="absolute inset-0 bg-primary/70 flex items-center justify-center text-primary-foreground">
                  <Check className="h-6 w-6" />
                </div>
              )}
              <span className="absolute bottom-1 right-1 bg-background/80 text-foreground text-xs px-1.5 py-0.5 rounded-sm capitalize">{side}</span>
            </button>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
