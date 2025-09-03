
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Heart, User } from 'lucide-react';
import { Search } from '@/components/search/search';
import { CartPreview } from './cart-preview';
import { WishlistPreview } from './wishlist-preview';
import { LoginDialog } from './login-dialog';

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-6">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-headline">VendorVerse</span>
        </Link>
        
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-lg relative">
            <Search />
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          <WishlistPreview />
           <CartPreview />
          <Button onClick={() => setIsLoginOpen(true)}>
            <User className="mr-2" />
            Login / Sign Up
          </Button>
        </nav>
      </div>
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </header>
  );
}
