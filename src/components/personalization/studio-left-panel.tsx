
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, MessageSquare } from 'lucide-react';
import Image from 'next/image';

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
                <h3 className="font-semibold mb-3">Total Price</h3>
                <p className="text-3xl font-bold">{product.price}</p>
                 <div className="mt-4 space-y-2">
                    <Button className="w-full">Add to Cart</Button>
                    <Button variant="secondary" className="w-full">Buy Now</Button>
                    <Button variant="outline" className="w-full">
                        <MessageSquare className="mr-2" />
                        Message Vendor
                    </Button>
                 </div>
            </div>
        </div>
    </ScrollArea>
  );
}
