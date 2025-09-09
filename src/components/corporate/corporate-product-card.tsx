

'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShoppingCart, Scale, Gavel, FileText, Brush, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBidRequest } from '@/hooks/use-bid-request';
import { useComparison } from '@/hooks/use-comparison';
import { useCorporateCart } from '@/hooks/use-corporate-cart';
import { useRouter } from 'next/navigation';
import { type DisplayPrice } from '@/lib/pricing-service';
import { Skeleton } from '../ui/skeleton';

interface CorporateProductCardProps {
  product: Product & { displayPrice: DisplayPrice };
  onAction: (actionName: string, productName: string) => void;
}

export function CorporateProductCard({ product, onAction }: CorporateProductCardProps) {
  const { toast } = useToast();
  const { items: bidItems, addItem: addBidItem } = useBidRequest();
  const { items: compareItems, addItem: addCompareItem, removeItem: removeCompareItem } = useComparison();
  const { items: cartItems, addItem: addCartItem } = useCorporateCart();
  const router = useRouter();

  const isAddedToBid = bidItems.some((item) => item.id === product.id);
  const isInCompare = compareItems.some((item) => item.id === product.id);
  const isInCart = cartItems.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    const result = addCartItem(product);
    toast({
      title: result.success ? 'Success' : 'Could Not Add to Cart',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };

  const handleBuyNow = () => {
    const result = addCartItem(product);
    toast({
        title: result.success ? 'Success' : 'Could Not Add to Cart',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
    });
    if (result.success) {
      router.push('/corporate/cart');
    }
  };

  const handleToggleCompare = async () => {
    const result = isInCompare ? removeCompareItem(product.id) : await addCompareItem(product);
    if (result.message) {
      toast({
        title: result.success ? (isInCompare ? 'Removed from Compare' : 'Added to Compare') : 'Could Not Update Compare',
        description: result.message,
        variant: result.variant,
      });
    }
  };

  const handleAddToBid = () => {
    const result = addBidItem(product);
    if(result.message) {
        toast({
            title: result.success ? 'Product Added to Bid' : 'Could Not Add Product',
            description: result.message,
            variant: result.variant,
        });
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

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
        <Link href={`/corporate/products/${product.id}`} className="block">
          <div className="overflow-hidden aspect-[4/3] bg-muted">
            {product.displayPrice?.hasDiscount && <Badge variant="destructive" className="absolute top-2 left-2 z-10">{product.displayPrice.discountText}</Badge>}
            {product.featured && <Badge className="absolute top-2 right-2 z-10">Featured</Badge>}
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint="corporate gift"
            />
          </div>
        </Link>
        {product.moq && (
          <Badge className="absolute bottom-2 right-2 z-10" variant="secondary">
            MOQ: {product.moq}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 flex flex-col flex-grow gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{product.vendor}</p>
          <Link href={`/corporate/products/${product.id}`} className="block">
            <h3 className="text-lg font-bold font-headline truncate">{product.name}</h3>
          </Link>
        </div>

        {product.displayPrice ? (
            <div className="flex flex-col">
                <span className="text-xl font-bold">{formatCurrency(product.displayPrice.finalPrice)}</span>
                {product.displayPrice.hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.displayPrice.originalPrice)}</span>
                )}
            </div>
        ) : (
             <p className="text-xl font-bold">{product.price}</p>
        )}

        <div className="flex-grow"></div>

        {primaryAction}

        <div className="grid grid-cols-2 gap-2">
           <Button variant="secondary" onClick={handleAddToCart}>
            {isInCart ? <PlusCircle className="mr-2" /> : <ShoppingCart className="mr-2" />}
            {isInCart ? 'Add More' : 'Add to Cart'}
          </Button>
          <Button variant="secondary" onClick={handleBuyNow}>Buy Now</Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={isInCompare ? "default" : "outline"} onClick={handleToggleCompare}>
                  <Scale className="mr-2" />
                  {isInCompare ? 'In Compare' : 'Compare'}
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
