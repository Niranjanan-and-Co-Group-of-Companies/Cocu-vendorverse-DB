

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
import { Heart, X } from 'lucide-react';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { LoginDialog } from './login-dialog';
import type { Product } from '@/lib/products';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export function WishlistPreview() {
  const { items, addItem } = useWishlist();
  const { toast } = useToast();
  // In a real app, this would come from an auth hook/context
  const [isLoggedIn] = React.useState(true); 
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);


  const handleRemove = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent dropdown from closing
    const result = await addItem(product); // addItem toggles
    toast({
        title: result.message,
        variant: 'destructive',
    });
  }

  if (!isLoggedIn) {
      return (
        <>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsLoginOpen(true)}>
                <Heart />
            </Button>
            <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
        </>
      )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Heart />
          {items.length > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{items.length}</Badge>
          )}
          <span className="sr-only">Wishlist</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>My Wishlist ({items.length})</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {items.length > 0 ? (
            <>
                <ScrollArea className="h-64">
                    <div className="pr-2">
                    {items.map(item => (
                        <DropdownMenuItem key={item.id} asChild className="focus:bg-transparent">
                            <Link href={`/products/${item.id}`} className="flex gap-3 w-full">
                                <div className="relative shrink-0">
                                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                                    {item.displayPrice?.hasDiscount && (
                                        <Badge variant="destructive" className="absolute top-1 left-1 text-[9px] px-1 py-0">
                                            {item.displayPrice.discountText}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{item.name}</p>
                                     {item.displayPrice ? (
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-sm font-semibold">{formatCurrency(item.displayPrice.finalPrice)}</p>
                                            {item.displayPrice.hasDiscount && (
                                                <p className="text-xs text-muted-foreground line-through">{formatCurrency(item.displayPrice.originalPrice)}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-semibold">{item.price}</p>
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => handleRemove(e, item)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                    </div>
                </ScrollArea>
                 <DropdownMenuFooter>
                    <Button asChild className="w-full">
                        <Link href="/wishlist">View Wishlist</Link>
                    </Button>
                </DropdownMenuFooter>
            </>
        ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Your wishlist is empty.
            </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
