
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2 } from 'lucide-react';
import { useCorporateCart, type CartItem as CartItemType } from '@/hooks/use-corporate-cart';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCorporateCart();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    setIsUpdating(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      if (!isNaN(newQuantity)) {
        await updateQuantity(item.id, newQuantity);
      }
       setIsUpdating(false);
    }, 500);
  };

  const handleRemove = () => {
    removeItem(item.id);
    toast({
      title: `"${item.name}" removed from cart.`,
      variant: 'destructive',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  const unitPrice = item.displayPrice?.finalPrice;
  const totalPrice = unitPrice ? unitPrice * item.quantity : undefined;

  return (
    <Card>
        <CardContent className="p-4 flex items-center gap-4">
            <Link href={`/corporate/products/${item.id}`}>
                <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover aspect-square"
                />
            </Link>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-2">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">by {item.vendor}</p>
                    {unitPrice !== undefined ? (
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold">{formatCurrency(unitPrice)}</span>
                            {item.displayPrice?.hasDiscount && (
                                <Badge variant="secondary">{item.displayPrice.discountText}</Badge>
                            )}
                         </div>
                    ) : (
                        <Skeleton className="h-5 w-24 mt-1" />
                    )}
                </div>
                <div>
                    <Input
                        type="number"
                        defaultValue={item.quantity}
                        onChange={handleQuantityChange}
                        min={item.moq || 1}
                        className="w-24"
                        aria-label="Quantity"
                    />
                    <p className="text-xs text-muted-foreground mt-1">MOQ: {item.moq}</p>
                </div>
                 <div className="flex flex-col items-end gap-2">
                     {isUpdating || totalPrice === undefined ? (
                         <Skeleton className="h-6 w-28" />
                     ) : (
                        <p className="font-semibold">
                            {formatCurrency(totalPrice)}
                        </p>
                     )}
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
