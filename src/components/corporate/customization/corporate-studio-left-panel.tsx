
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, FileText, Gavel } from 'lucide-react';
import Image from 'next/image';

interface CorporateStudioLeftPanelProps {
  product: Product;
}

export function CorporateStudioLeftPanel({ product }: CorporateStudioLeftPanelProps) {
  return (
    <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-sm text-muted-foreground">by {product.vendor}</p>
            </div>
            
             <Separator />

            <div>
                <h3 className="font-semibold mb-3">Product Sides</h3>
                <div className="grid grid-cols-2 gap-2">
                   {Object.entries(product.customizationSides).map(([side, data]) => {
                       if (!data.image) return null;
                       return (
                           <button key={side} className="relative aspect-square rounded-md border-2 border-primary overflow-hidden">
                               <Image src={data.image} alt={side} fill className="object-cover" />
                               <div className="absolute inset-0 bg-primary/70 flex items-center justify-center text-primary-foreground">
                                   <Check className="h-6 w-6"/>
                               </div>
                               <span className="absolute bottom-1 right-1 bg-background/80 text-foreground text-xs px-1.5 py-0.5 rounded-sm capitalize">{side}</span>
                           </button>
                       )
                   })}
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="font-semibold mb-3">Pricing</h3>
                <p className="text-sm text-muted-foreground">Pricing will be determined by vendors based on your final design and quantity.</p>
                 <div className="mt-4 space-y-2">
                    <Button className="w-full">
                        <FileText className="mr-2" />
                        Request a Quote
                    </Button>
                    <Button variant="secondary" className="w-full">
                        <Gavel className="mr-2" />
                        Add to Bid Request
                    </Button>
                 </div>
            </div>
        </div>
    </ScrollArea>
  );
}
