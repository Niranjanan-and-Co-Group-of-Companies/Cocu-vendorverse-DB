
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useCorporateCart, type CartItem as CartItemType } from '@/hooks/use-corporate-cart';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCorporateCart();
  const { toast } = useToast();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
    toast({
      title: `"${item.name}" removed from cart.`,
      variant: 'destructive',
    });
  };

  return (
    <Card>
        <CardContent className="p-4 flex items-center gap-4">
            <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md object-cover aspect-square"
            />
            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-2">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">by {item.vendor}</p>
                    <p className="text-sm text-muted-foreground">Unit Price: {item.price}</p>
                </div>
                <div>
                    <Input
                        type="number"
                        value={item.quantity}
                        onChange={handleQuantityChange}
                        min={item.moq || 1}
                        className="w-20"
                        aria-label="Quantity"
                    />
                    <p className="text-xs text-muted-foreground mt-1">MOQ: {item.moq}</p>
                </div>
                 <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">
                        ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleRemove}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
