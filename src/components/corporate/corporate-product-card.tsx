
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShoppingCart, Scale, Gavel, FileText, Brush } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CorporateProductCardProps {
  product: Product;
  onAction: (actionName: string, productName: string) => void;
}

export function CorporateProductCard({ product, onAction }: CorporateProductCardProps) {
  const { toast } = useToast();
  const [isAddedToBid, setIsAddedToBid] = React.useState(false);
  const [isInCompare, setIsInCompare] = React.useState(false);

  const handleAddToCart = () => {
    // Placeholder for useCart context logic
    toast({
      title: 'Added to Cart',
      description: `"${product.name}" (MOQ: ${product.moq}) has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    // Placeholder for useCart context logic + redirect
    toast({
      title: 'Redirecting to Checkout',
      description: `"${product.name}" has been added to your cart.`,
    });
    // In a real app: router.push('/checkout');
  };

  const handleToggleCompare = () => {
    // Placeholder for useComparison context logic
    const newCompareState = !isInCompare;
    setIsInCompare(newCompareState);
    toast({
      title: newCompareState ? 'Added to Compare' : 'Removed from Compare',
      description: `"${product.name}" has been ${newCompareState ? 'added to' : 'removed from'} your comparison list.`,
    });
  };

  const handleAddToBid = () => {
    // Placeholder for useBidRequest context logic
    setIsAddedToBid(true);
    toast({
      title: 'Added to Bid Request',
      description: `"${product.name}" has been added to your bid request.`,
    });
  };


  const primaryAction = product.customizable ? (
    <Button asChild className="w-full">
      <Link href={`/corporate/customize/${product.id}`}>
        <Brush className="mr-2" />
        Customize & Quote
      </Link>
    </Button>
  ) : (
    <Button asChild className="w-full">
      <Link href={`/corporate/quote/${product.id}`}>
        <FileText className="mr-2" />
        Request a Quote
      </Link>
    </Button>
  );

  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <div className="relative">
        <div className="overflow-hidden aspect-[4/3] bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint="corporate gift"
          />
        </div>
        {product.moq && (
          <Badge className="absolute top-2 left-2 z-10" variant="secondary">
            MOQ: {product.moq}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 flex flex-col flex-grow gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{product.vendor}</p>
          <h3 className="text-lg font-bold font-headline truncate">{product.name}</h3>
        </div>

        <div className="flex-grow"></div>

        {primaryAction}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2" />
            Add to Cart
          </Button>
          <Button variant="secondary" onClick={handleBuyNow}>Buy Now</Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={isInCompare ? "default" : "outline"} onClick={handleToggleCompare}>
                  <Scale className="mr-2" />
                  Compare
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add to a list to compare products side-by-side.</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleAddToBid} disabled={isAddedToBid}>
                  <Gavel className="mr-2" />
                  {isAddedToBid ? 'Added to Bid' : 'Add to Bid'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add to a new bid request to get quotes from vendors.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
