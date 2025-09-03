
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Gavel, Scale, FileText, Brush } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useBidRequest } from '@/hooks/use-bid-request';
import { useComparison } from '@/hooks/use-comparison';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CorporateProductInteractionsProps {
  product: Product;
}

export function CorporateProductInteractions({ product }: CorporateProductInteractionsProps) {
  const { toast } = useToast();
  const { addItem: addToCart } = useCart();
  const { addItem: addToBid, items: bidItems } = useBidRequest();
  const { addItem: addToCompare, removeItem: removeFromCompare, items: compareItems } = useComparison();
  
  const isAddedToBid = bidItems.some((item) => item.id === product.id);
  const isInCompare = compareItems.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    const result = addToCart(product);
    toast({
      title: result.success ? 'Success' : 'Could Not Add to Cart',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };

  const handleAddToBid = () => {
    const result = addToBid(product);
    if(result.message) {
        toast({
            title: result.success ? 'Product Added to Bid' : 'Could Not Add Product',
            description: result.message,
            variant: result.variant,
        });
    }
  };

  const handleToggleCompare = () => {
    const result = isInCompare ? removeFromCompare(product.id) : addToCompare(product);
    if (result.message) {
      toast({
        title: result.success ? (isInCompare ? 'Removed from Compare' : 'Added to Compare') : 'Could Not Update Compare',
        description: result.message,
        variant: result.variant,
      });
    }
  };

  const primaryAction = product.customizable ? (
    <Button asChild size="lg" className="w-full">
      <Link href={`/corporate/customize/${product.id}`}>
        <Brush className="mr-2" />
        Customize & Quote
      </Link>
    </Button>
  ) : (
    <Button asChild size="lg" className="w-full">
      <Link href={`/corporate/quote/${product.id}`}>
        <FileText className="mr-2" />
        Request a Quote
      </Link>
    </Button>
  );

  return (
    <div className="space-y-4">
      {primaryAction}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button size="lg" variant="outline" onClick={handleAddToCart} className="w-full">
          <ShoppingCart className="mr-2" />
          Add to Cart
        </Button>
        <Button size="lg" variant="outline" onClick={handleAddToBid} disabled={isAddedToBid} className="w-full">
          <Gavel className="mr-2" />
          {isAddedToBid ? 'Added to Bid' : 'Add to Bid'}
        </Button>
        <Button size="lg" variant="outline" onClick={handleToggleCompare} className={cn("w-full", isInCompare && "bg-accent")}>
          <Scale className="mr-2" />
          {isInCompare ? 'In Compare' : 'Compare'}
        </Button>
      </div>
    </div>
  );
}
