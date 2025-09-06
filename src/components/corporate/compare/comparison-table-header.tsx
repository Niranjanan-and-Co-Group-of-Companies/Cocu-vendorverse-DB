
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useComparison } from '@/hooks/use-comparison';
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';

interface ComparisonTableHeaderProps {
  product: Product;
}

export function ComparisonTableHeader({ product }: ComparisonTableHeaderProps) {
  const { removeItem } = useComparison();
  const { toast } = useToast();

  const handleRemove = () => {
    const result = removeItem(product.id);
    if(result.success) {
      toast({
        title: 'Product Removed',
        description: result.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-3 relative h-full flex flex-col pt-4">
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-0 right-0 h-7 w-7 text-muted-foreground"
            onClick={handleRemove}
        >
            <X className="h-4 w-4" />
        </Button>
      <Link href={`/corporate/products/${product.id}`} className="block aspect-square rounded-lg overflow-hidden bg-muted relative">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="w-full h-full object-cover"
        />
      </Link>
      <h3 className="font-bold text-base h-12 line-clamp-2">
        <Link href={`/corporate/products/${product.id}`} className="hover:underline">
            {product.name}
        </Link>
      </h3>
    </div>
  );
}
