
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, MessageSquare, Heart, Bell, Minus, Plus, Brush } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Label } from '../ui/label';

interface ProductInteractionsProps {
  product: Product;
}

export function ProductInteractions({ product }: ProductInteractionsProps) {
  const [pincode, setPincode] = React.useState('');
  const [deliveryInfo, setDeliveryInfo] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();


  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => {
        const newQuantity = prev + amount;
        const maxQty = product.maxQuantityPerOrder || product.stock;
        if (newQuantity < 1) return 1;
        if (newQuantity > maxQty) return maxQty;
        return newQuantity;
    });
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: 'Added to Cart',
      description: `${quantity} x "${product.name}" added to your cart.`
    });
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/cart'); // Navigate to cart after adding
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
        return (
            <div className="space-y-4">
                 <Button size="lg" className="w-full">
                    <Brush className="mr-2" />
                    Customize Now
                </Button>
                <div className="grid grid-cols-2 gap-3">
                    <Button size="lg" className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2" />
                        Add to Cart
                    </Button>
                    <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>
                        Buy Now
                    </Button>
                </div>
            </div>
        );
    }
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
            <Button size="lg" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>Buy Now</Button>
        </div>
      </div>
    );
  }

  const maxQuantity = product.maxQuantityPerOrder || product.stock;

  return (
    <div className="space-y-6">
        {product.stock > 0 && (
            <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Input 
                        type="text" 
                        readOnly 
                        value={quantity} 
                        className="w-16 text-center" 
                    />
                     <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= maxQuantity}>
                        <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">({maxQuantity} available)</span>
                </div>
            </div>
        )}

        {renderMainActions()}
        
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
