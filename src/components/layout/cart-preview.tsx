
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuFooter,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

export function CartPreview() {
  const { items, removeItem } = useCart();
  const { toast } = useToast();

  const handleRemove = (e: React.MouseEvent, productId: number, productName: string) => {
    e.preventDefault(); // Prevent dropdown from closing
    removeItem(productId);
    toast({
        title: `"${productName}" removed from cart.`,
        variant: 'destructive',
    });
  }

  const subtotal = items.reduce((acc, item) => {
    return acc + (parseFloat(item.price.replace('$', '')) * item.quantity);
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart />
          {items.length > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{items.length}</Badge>
          )}
          <span className="sr-only">Cart</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>My Cart ({items.length})</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {items.length > 0 ? (
            <>
                <ScrollArea className="h-64">
                    <div className="pr-2">
                    {items.map(item => (
                        <DropdownMenuItem key={item.id} asChild className="focus:bg-transparent">
                            <Link href={`/products/${item.id}`} className="flex gap-3 w-full">
                                <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    <p className="text-sm font-semibold">{formatCurrency(parseFloat(item.price.replace('$', '')) * item.quantity)}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => handleRemove(e, item.id, item.name)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                    </div>
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="focus:bg-transparent">
                    <div className="w-full flex justify-between font-semibold">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                </DropdownMenuItem>
                 <DropdownMenuFooter>
                    <Button asChild className="w-full">
                        <Link href="/cart">View Cart & Checkout</Link>
                    </Button>
                </DropdownMenuFooter>
            </>
        ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Your cart is empty.
            </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

