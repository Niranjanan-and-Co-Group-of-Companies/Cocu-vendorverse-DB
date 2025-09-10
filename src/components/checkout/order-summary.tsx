
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart, type CartItem } from '@/hooks/use-cart';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Tag, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
}

export function OrderSummary() {
  const { items, removeItem } = useCart();
  const { toast } = useToast();
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');

  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', ''));
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const handleRemove = (cartItemId: string, name: string) => {
    removeItem(cartItemId);
    toast({
        title: "Item Removed",
        description: `"${name}" has been removed from your cart.`,
        variant: "destructive"
    })
  }

  const convenienceFee = subtotal * 0.03;
  const shippingFee = 49; // Mock fee, will be dynamic later
  const total = subtotal + convenienceFee + shippingFee;
  
  const canPlaceOrder = isConfirmed && agreedToTerms;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-48 pr-4">
            <div className="space-y-4">
                {items.map(item => {
                  const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', ''));
                  return (
                    <div key={item.cartItemId} className="flex items-center gap-4">
                        <Image src={item.selectedVariant?.image || item.image} alt={item.name} width={64} height={64} className="rounded-md aspect-square object-cover" />
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="font-medium">{formatCurrency(price * item.quantity)}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemove(item.cartItemId, item.name)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )})}
            </div>
        </ScrollArea>
        <Separator />
        <div className="flex items-center gap-2">
            <Tag className="text-muted-foreground" />
            <Input placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
            <Button variant="secondary" disabled={!couponCode}>Apply</Button>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shippingFee)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Convenience Fee (3%)</span>
                <span className="text-muted-foreground">{formatCurrency(convenienceFee)}</span>
            </div>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-start">
         <div className="flex items-center space-x-2">
            <Checkbox id="design-confirm" checked={isConfirmed} onCheckedChange={(checked) => setIsConfirmed(!!checked)} />
            <Label htmlFor="design-confirm" className="text-sm font-normal">I confirm my personalization design is correct.</Label>
         </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms-confirm" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(!!checked)} />
            <Label htmlFor="terms-confirm" className="text-sm font-normal">I agree to the Terms & Conditions.</Label>
         </div>
        <Button className="w-full" size="lg" disabled={!canPlaceOrder}>
          Place Order & Pay
        </Button>
      </CardFooter>
    </Card>
  );
}
