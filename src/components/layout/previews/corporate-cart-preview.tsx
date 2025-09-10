
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
import { useCorporateCart } from '@/hooks/use-corporate-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { getCategoryByName } from '@/lib/categories-service';

interface CartItemWithPrice extends Product {
  quantity: number;
  displayPrice?: DisplayPrice;
}


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function CorporateCartPreview() {
  const { items, removeItem } = useCorporateCart();
  const { toast } = useToast();
  const [cartItemsWithPrices, setCartItemsWithPrices] = React.useState<CartItemWithPrice[]>([]);

  React.useEffect(() => {
    const fetchPrices = async () => {
        const pricedItems = await Promise.all(
            items.map(async item => {
                const category = await getCategoryByName(item.category);
                const displayPrice = await calculateDisplayPrice(
                    {...item, vendorSP: parseFloat(item.price)},
                    'Corporate',
                    category || undefined,
                    item.quantity
                );
                return { ...item, displayPrice };
            })
        );
        setCartItemsWithPrices(pricedItems);
    }
    fetchPrices();
  }, [items]);

  const handleRemove = (e: React.MouseEvent, productId: number, productName: string) => {
    e.preventDefault();
    removeItem(productId);
    toast({
        title: `"${productName}" removed from cart.`,
        variant: 'destructive',
    });
  }

  const subtotal = cartItemsWithPrices.reduce((acc, item) => {
    const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', '').replace('₹', ''));
    return acc + (price * item.quantity);
  }, 0);


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
                    {cartItemsWithPrices.map(item => {
                        const finalPrice = item.displayPrice?.finalPrice || parseFloat(item.price);
                        const originalPrice = item.displayPrice?.originalPrice || finalPrice;

                        return (
                        <DropdownMenuItem key={item.id} asChild className="focus:bg-transparent">
                            <Link href={`/corporate/products/${item.id}`} className="flex gap-3 w-full">
                                <div className="relative shrink-0">
                                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                                    {item.displayPrice?.hasDiscount && (
                                        <Badge variant="destructive" className="absolute top-1 left-1 text-[8px] px-1 py-0">
                                            {item.displayPrice.discountText}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-sm font-semibold">{formatCurrency(finalPrice * item.quantity)}</p>
                                        {item.displayPrice?.hasDiscount && (
                                             <p className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice * item.quantity)}</p>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => handleRemove(e, item.id, item.name)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </Link>
                        </DropdownMenuItem>
                    )})}
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
                        <Link href="/corporate/cart">View Cart & Checkout</Link>
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
