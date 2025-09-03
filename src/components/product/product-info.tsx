
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { VendorInfoDialog } from './vendor-info-dialog';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [isVendorInfoOpen, setIsVendorInfoOpen] = React.useState(false);

  // NOTE: Pricing logic with commissions and discounts will be added here later.
  // For now, it displays the base price.
  const displayPrice = product.price;
  const originalPrice = null; // Placeholder for when discounts are active

  return (
    <>
        <div className="space-y-4">
        <div>
            {product.category && (
                <Link href={`/category/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-sm text-primary font-medium hover:underline">
                    {product.category}
                </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
            <p className="text-muted-foreground">
                Sold by <button onClick={() => setIsVendorInfoOpen(true)} className="text-primary hover:underline font-medium">{product.vendor}</button>
            </p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-bold text-lg">{product.rating}</span>
                <span className="text-sm text-muted-foreground">(24 ratings)</span>
            </div>
            <div className="flex items-center gap-2">
                {product.stock > 0 && product.stock < 10 && (
                    <span className="text-sm font-medium text-destructive">Low Stock</span>
                )}
                {product.stock === 0 && (
                    <span className="text-sm font-medium text-destructive">Out of Stock</span>
                )}
            </div>
        </div>
        
        <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{displayPrice}</span>
            {originalPrice && (
            <span className="text-xl text-muted-foreground line-through">{originalPrice}</span>
            )}
        </div>
        </div>

        <VendorInfoDialog 
            open={isVendorInfoOpen}
            onOpenChange={setIsVendorInfoOpen}
            vendorName={product.vendor}
            vendorBio={product.creatorStory || ''}
        />
    </>
  );
}
