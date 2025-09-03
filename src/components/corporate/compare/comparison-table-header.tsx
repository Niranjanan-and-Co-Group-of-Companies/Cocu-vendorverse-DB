
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useComparison } from '@/hooks/use-comparison';
import type { Product } from '@/lib/products';

interface ComparisonTableHeaderProps {
  product: Product;
}

export function ComparisonTableHeader({ product }: ComparisonTableHeaderProps) {
  const { removeItem } = useComparison();

  return (
    <div className="p-4 space-y-3 relative">
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground"
            onClick={() => removeItem(product.id)}
        >
            <X className="h-4 w-4" />
        </Button>
      <Link href={`/products/${product.id}`} className="block aspect-square rounded-lg overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          width={200}
          height={200}
          className="w-full h-full object-cover"
        />
      </Link>
      <h3 className="font-bold text-base h-12 line-clamp-2">
        <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
        </Link>
      </h3>
    </div>
  );
}
