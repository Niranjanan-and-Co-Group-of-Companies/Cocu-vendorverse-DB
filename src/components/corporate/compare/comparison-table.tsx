
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
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
      <div className="flex w-max">
        {/* Header Column */}
        <div className="w-48 sticky left-0 bg-background z-10 border-r">
          <div className="h-[213px]"></div> {/* Spacer for header */}
          {featureRows.map((feature, index) => (
            <div key={index} className={cn("p-4 h-16 flex items-center font-semibold", index % 2 === 1 ? 'bg-muted/50' : 'bg-background' )}>
              {feature.label}
            </div>
          ))}
           <div className="h-[93px]"></div> {/* Spacer for actions */}
        </div>

        {/* Product Columns */}
        {products.map((product) => (
          <div key={product.id} className="w-56 border-r">
            <ComparisonTableHeader product={product} />
            <div className="border-t">
              {featureRows.map((feature, index) => (
                <div key={index} className={cn("p-4 h-16 flex items-center text-sm truncate", index % 2 === 1 ? 'bg-muted/50' : 'bg-background' )}>
                  {feature.getValue(product)}
                </div>
              ))}
            </div>
            <div className="border-t">
              <ComparisonTableActions product={product} />
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
