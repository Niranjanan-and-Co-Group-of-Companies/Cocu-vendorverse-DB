
'use client';

import * as React from 'react';
import { useComparison } from '@/hooks/use-comparison';
import { ComparisonTable } from '@/components/corporate/compare/comparison-table';
import { Button } from '@/components/ui/button';
import { Scale, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { items, clearAll } = useComparison();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Compare Products</h1>
          <p className="text-muted-foreground mt-2">
            Side-by-side comparison of your selected items.
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      {items.length > 0 ? (
        <ComparisonTable products={items} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-24">
            <SlidersHorizontal className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Your comparison list is empty.</h3>
            <p className="max-w-md">Add products from the catalog to compare their features, pricing, and customization options side-by-side.</p>
             <Button asChild className="mt-4">
                <Link href="/corporate/products">
                    <Scale className="mr-2" />
                    Browse Products to Compare
                </Link>
             </Button>
        </div>
      )}
    </div>
  );
}
