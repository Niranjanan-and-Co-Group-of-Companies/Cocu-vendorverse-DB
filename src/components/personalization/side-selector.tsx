
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Image from 'next/image';

interface SideSelectorProps {
  product: Product;
}

export function SideSelector({ product }: SideSelectorProps) {
  // In a real app, this state would be shared via context to control the canvas
  const [activeSide, setActiveSide] = React.useState('front');

  return (
    <div className="w-full p-2">
      <h3 className="font-semibold text-sm mb-2 md:text-base md:mb-3">Product Sides</h3>
      <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
        {Object.entries(product.customizationSides).map(([side, data]) => {
          if (!data.image) return null;
          const isActive = side === activeSide;
          return (
            <button 
              key={side} 
              className="relative aspect-square rounded-md border-2 overflow-hidden border-transparent data-[active=true]:border-primary"
              data-active={isActive}
              onClick={() => setActiveSide(side)}
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
      </div>
    </div>
  );
}
