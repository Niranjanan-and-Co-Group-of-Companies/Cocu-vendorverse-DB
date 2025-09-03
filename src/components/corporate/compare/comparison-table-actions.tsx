
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';

interface ComparisonTableActionsProps {
  product: Product;
}

export function ComparisonTableActions({ product }: ComparisonTableActionsProps) {
  const { toast } = useToast();

  const handleAddToCart = () => {
    toast({
      title: 'Added to Cart',
      description: `"${product.name}" has been added to your cart.`,
    });
  };
  
  return (
    <div className="p-4">
      <Button className="w-full" onClick={handleAddToCart}>
        <ShoppingCart className="mr-2" />
        Add to Cart
      </Button>
    </div>
  );
}
