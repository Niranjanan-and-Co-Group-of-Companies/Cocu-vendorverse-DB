
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Check, Star, X as XIcon } from 'lucide-react';
import { ComparisonTableHeader } from './comparison-table-header';
import { ComparisonTableActions } from './comparison-table-actions';
import { cn } from '@/lib/utils';

interface ComparisonTableProps {
  products: Product[];
}

interface FeatureRow {
    label: string;
    getValue: (product: Product) => React.ReactNode;
}

const featureRows: FeatureRow[] = [
    { label: "Price", getValue: (p) => <span className="font-bold text-primary">{p.price}</span> },
    { label: "Rating", getValue: (p) => (
        <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{p.rating}</span>
        </div>
    )},
    { label: "Min. Order Qty (MOQ)", getValue: (p) => p.moq || '1' },
    { label: "Customizable", getValue: (p) => p.customizable ? <Check className="text-green-600"/> : <XIcon className="text-destructive"/> },
    { label: "Category", getValue: (p) => p.category },
    { label: "Vendor", getValue: (p) => p.vendor },
];


export function ComparisonTable({ products }: ComparisonTableProps) {
  const gridCols = `grid-cols-[12rem_repeat(${products.length},_minmax(14rem,_1fr))]`;

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
      <div className={cn("grid w-full", gridCols)}>
        {/* Row 1: Product Headers */}
        <div className="sticky left-0 bg-background z-10 border-r"></div>
        {products.map(product => (
            <div key={`header-${product.id}`} className="border-r">
                <ComparisonTableHeader product={product} />
            </div>
        ))}
        
        {/* Feature Rows */}
        {featureRows.map((feature, index) => (
            <React.Fragment key={feature.label}>
                {/* Feature Label Column */}
                <div className={cn(
                    "sticky left-0 bg-background z-10 p-4 h-16 flex items-center font-semibold border-r border-t",
                    index % 2 === 1 ? 'bg-muted/50' : 'bg-background'
                )}>
                    {feature.label}
                </div>
                {/* Product Value Columns */}
                {products.map(product => (
                    <div key={`cell-${product.id}-${feature.label}`} className={cn(
                        "p-4 h-16 flex items-center text-sm truncate border-r border-t",
                        index % 2 === 1 ? 'bg-muted/50' : 'bg-background'
                    )}>
                        {feature.getValue(product)}
                    </div>
                ))}
            </React.Fragment>
        ))}

        {/* Action Row */}
        <div className="sticky left-0 bg-background z-10 border-r border-t"></div>
        {products.map(product => (
             <div key={`action-${product.id}`} className="border-r border-t">
                <ComparisonTableActions product={product} />
            </div>
        ))}

      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
