
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

export function WishlistPreview() {
  const { items, removeItem } = useWishlist();
  const { toast } = useToast();
  // In a real app, this would come from an auth hook/context
  const [isLoggedIn] = React.useState(false); 
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);


  const handleRemove = (e: React.MouseEvent, productId: number) => {
    e.preventDefault(); // Prevent dropdown from closing
    const result = removeItem(productId);
    if(result.success){
        toast({
            title: result.message,
            variant: 'destructive',
        });
    }
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
                                <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-sm font-semibold">{item.price}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => handleRemove(e, item.id)}>
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
