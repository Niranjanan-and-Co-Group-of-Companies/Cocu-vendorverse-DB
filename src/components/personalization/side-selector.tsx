
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SideSelectorProps {
  product: Product;
}

export function SideSelector({ product }: SideSelectorProps) {
  // In a real app, this state would be shared via context to control the canvas
  const [activeSide, setActiveSide] = React.useState('front');
  const [isOpen, setIsOpen] = React.useState(false)

  return (
     <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full p-2 absolute bottom-0 left-0 bg-background/80 backdrop-blur-sm border-t rounded-t-lg"
    >
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between p-2">
            <h3 className="font-semibold text-sm">Product Sides</h3>
            <ChevronsUpDown className="h-4 w-4" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-4 md:grid-cols-2 gap-2 p-2">
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
      </CollapsibleContent>
    </Collapsible>
  );
}
