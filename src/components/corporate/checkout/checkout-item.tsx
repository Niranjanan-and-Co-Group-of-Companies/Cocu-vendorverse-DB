
'use client';

import * as React from 'react';
import Image from 'next/image';
import type { CartItem as CartItemType } from '@/hooks/use-corporate-cart';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CheckoutItemProps {
  item: CartItemType;
}

export function CheckoutItem({ item }: CheckoutItemProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  const unitPrice = item.displayPrice?.finalPrice;
  const totalPrice = unitPrice ? unitPrice * item.quantity : undefined;

  return (
    <div className="flex items-start gap-4">
        <Link href={`/corporate/products/${item.id}`} className="shrink-0">
            <Image
                src={item.image}
                alt={item.name}
                width={64}
                height={64}
                className="rounded-md object-cover aspect-square"
            />
        </Link>
        <div className="flex-grow">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-muted-foreground">
                Qty: {item.quantity}
            </p>
             {unitPrice !== undefined ? (
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{formatCurrency(unitPrice)} / unit</span>
                    {item.displayPrice?.hasDiscount && (
                        <Badge variant="secondary">{item.displayPrice.discountText}</Badge>
                    )}
                 </div>
            ) : null}
        </div>
        <div className="text-right">
            {totalPrice !== undefined ? (
                <p className="font-semibold">
                    {formatCurrency(totalPrice)}
                </p>
            ) : null}
        </div>
    </div>
  );
}
