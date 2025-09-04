
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart, type CartItem } from '@/hooks/use-cart';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function OrderSummary() {
  const { items } = useCart();
  const [coupon, setCoupon] = React.useState('');
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);

  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      return total + parseFloat(item.price.replace('$', '')) * item.quantity;
    }, 0);
  }, [items]);

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
                {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                        <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md aspect-square object-cover" />
                        <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(parseFloat(item.price.replace('$', '')) * item.quantity)}</p>
                    </div>
                ))}
            </div>
        </ScrollArea>
        <Separator />
        <div className="flex gap-2">
            <Input 
                placeholder="Discount code" 
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
            />
            <Button variant="outline" disabled={!coupon}>Apply</Button>
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
