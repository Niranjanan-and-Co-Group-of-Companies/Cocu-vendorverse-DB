
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, MessageSquare, Heart, Bell } from 'lucide-react';

interface ProductInteractionsProps {
  product: Product;
}

export function ProductInteractions({ product }: ProductInteractionsProps) {
  const [pincode, setPincode] = React.useState('');
  const [deliveryInfo, setDeliveryInfo] = React.useState('');
  const [checking, setChecking] = React.useState(false);

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
  
  const renderMainActions = () => {
    if (product.stock === 0) {
        return (
            <Button size="lg" className="w-full">
                <Bell className="mr-2" />
                Notify Me When Available
            </Button>
        );
    }
    if (product.customizable) {
        return <Button size="lg" className="w-full">Customize Now</Button>
    }
    return (
      <>
        <Button size="lg" className="w-full">
          <ShoppingCart className="mr-2" />
          Add to Cart
        </Button>
        <Button size="lg" variant="secondary" className="w-full">Buy Now</Button>
      </>
    );
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
            {renderMainActions()}
        </div>
         <div className="grid grid-cols-2 gap-3">
            <Button size="lg" variant="outline" className="w-full">
                <Heart className="mr-2" />
                Add to Wishlist
            </Button>
             <Button size="lg" variant="outline" className="w-full">
                <MessageSquare className="mr-2" />
                Message Vendor
            </Button>
        </div>
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
    </div>
  );
}
