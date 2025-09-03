
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CartItem } from '@/hooks/use-cart';

interface CartSummaryProps {
  items: CartItem[];
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      return total + parseFloat(item.price.replace('$', '')) * item.quantity;
    }, 0);
  }, [items]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at next step</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Taxes</span>
          <span className="text-muted-foreground">Calculated at next step</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Estimated Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
