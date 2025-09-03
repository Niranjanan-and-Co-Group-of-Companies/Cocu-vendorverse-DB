
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Gavel, Scale, FileText, Brush, MessageSquare, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCorporateCart } from '@/hooks/use-corporate-cart';
import { useBidRequest } from '@/hooks/use-bid-request';
import { useComparison } from '@/hooks/use-comparison';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { BulkPricingCalculator } from './bulk-pricing-calculator';

interface CorporateProductInteractionsProps {
  product: Product;
  onPriceChange: (details: { unit: string; total: number; quantity: number }) => void;
}

export function CorporateProductInteractions({ product, onPriceChange }: CorporateProductInteractionsProps) {
  const { toast } = useToast();
  const { addItem: addToCart } = useCorporateCart();
  const { addItem: addToBid, items: bidItems } = useBidRequest();
  const { addItem: addToCompare, removeItem: removeFromCompare, items: compareItems } = useComparison();
  const router = useRouter();

  const [pincode, setPincode] = React.useState('');
  const [deliveryInfo, setDeliveryInfo] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  
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

  const handleBuyNow = () => {
    const result = addToCart(product);
    toast({
      title: result.success ? 'Success' : 'Could Not Add to Cart',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    if (result.success) {
      router.push('/corporate/cart');
    }
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

  const handleCheckDelivery = () => {
    if (!pincode) return;
    setChecking(true);
    // Simulate API call
    setTimeout(() => {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        setDeliveryInfo(`Estimated delivery by ${deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}.`);
        setChecking(false);
    }, 1000);
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

  const renderActions = () => {
    if (product.stock === 0) {
      return (
        <Button size="lg" className="w-full">
            <Bell className="mr-2" />
            Notify Me When Available
        </Button>
      );
    }
    return (
      <>
        {product.moq && <BulkPricingCalculator product={product} onPriceChange={onPriceChange} />}

        {primaryAction}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button size="lg" variant="secondary" onClick={handleAddToCart} className="w-full">
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
            <Button size="lg" variant="secondary" onClick={handleBuyNow} className="w-full">
              Buy Now
            </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button size="lg" variant="outline" onClick={handleAddToBid} disabled={isAddedToBid} className="w-full">
              <Gavel className="mr-2" />
              {isAddedToBid ? 'Added to Bid' : 'Add to Bid'}
            </Button>
            <Button size="lg" variant="outline" onClick={handleToggleCompare} className={cn("w-full", isInCompare && "bg-accent")}>
              <Scale className="mr-2" />
              {isInCompare ? 'In Compare' : 'Compare'}
            </Button>
            <Button size="lg" variant="outline" className="w-full">
              <MessageSquare className="mr-2" />
              Message Vendor
            </Button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">{renderActions()}</div>
      
      {product.stock > 0 && (
        <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold">Check Delivery</h4>
            <div className="flex gap-2">
                <Input 
                    placeholder="Enter Pincode" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                />
                <Button onClick={handleCheckDelivery} disabled={checking}>
                    {checking ? 'Checking...' : 'Check'}
                </Button>
            </div>
            {deliveryInfo && <p className="text-sm text-muted-foreground">{deliveryInfo}</p>}
        </div>
      )}
    </div>
  );
}
