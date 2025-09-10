

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
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { LoginDialog } from './login-dialog';

export function CartPreview() {
  const { items, removeItem, updateQuantity } = useCart();
  const { toast } = useToast();
  // In a real app, this would come from an auth hook/context
  const [isLoggedIn] = React.useState(true); 
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  const handleRemove = (e: React.MouseEvent, cartItemId: string, productName: string) => {
    e.preventDefault(); // Prevent dropdown from closing
    removeItem(cartItemId);
    toast({
        title: `"${productName}" removed from cart.`,
        variant: 'destructive',
    });
  }

  const handleQuantityChange = (e: React.MouseEvent, cartItemId: string, newQuantity: number) => {
    e.preventDefault();
    updateQuantity(cartItemId, newQuantity);
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', '').replace('₹', ''));
    return acc + (price * item.quantity);
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  }
  
  if (!isLoggedIn) {
      return (
          <>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsLoginOpen(true)}>
                <ShoppingCart />
            </Button>
            <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
          </>
      )
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
                    {items.map(item => {
                        const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', '').replace('₹', ''));
                        const maxQty = item.maxQuantityPerOrder || item.stock;
                        return (
                            <DropdownMenuItem key={item.cartItemId} asChild className="focus:bg-transparent">
                                <Link href={`/products/${item.id}`} className="flex gap-3 w-full">
                                    <div className="relative shrink-0">
                                        <Image src={item.selectedVariant?.image || item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                                        {item.displayPrice?.hasDiscount && (
                                            <Badge variant="destructive" className="absolute top-1 left-1 text-[10px] px-1.5 py-0">
                                                {item.displayPrice.discountText}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium truncate">{item.name}</p>
                                        {item.selectedVariant && <p className="text-xs text-muted-foreground">{item.selectedVariant.colorName}</p>}
                                        <div className="flex items-center gap-2 mt-1">
                                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={(e) => handleQuantityChange(e, item.cartItemId, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-3 w-3"/></Button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={(e) => handleQuantityChange(e, item.cartItemId, item.quantity + 1)} disabled={item.quantity >= maxQty}><Plus className="h-3 w-3"/></Button>
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <p className="text-sm font-semibold">{formatCurrency(price * item.quantity)}</p>
                                            {item.displayPrice?.hasDiscount && (
                                                 <p className="text-xs text-muted-foreground line-through">{formatCurrency(item.displayPrice.originalPrice * item.quantity)}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive self-start" onClick={(e) => handleRemove(e, item.cartItemId, item.name)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </DropdownMenuItem>
                        )
                    })}
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
                        <Link href="/checkout">View Cart & Checkout</Link>
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
