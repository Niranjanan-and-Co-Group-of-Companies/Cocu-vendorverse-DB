
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';
import { useCorporateCart } from '@/hooks/use-corporate-cart';

interface ComparisonTableActionsProps {
  product: Product;
}

export function ComparisonTableActions({ product }: ComparisonTableActionsProps) {
  const { toast } = useToast();
  const { addItem } = useCorporateCart();

  const handleAddToCart = () => {
    const result = addItem(product);
    toast({
      title: result.success ? 'Added to Cart' : 'Could Not Add to Cart',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };
  
  return (
    <div>
      <Button className="w-full" onClick={handleAddToCart} size="sm">
        <ShoppingCart className="mr-2" />
        Add to Cart
      </Button>
    </div>
  );
}
