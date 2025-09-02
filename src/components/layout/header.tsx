import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Heart, ShoppingCart, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-headline">GiftSphere</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist">
              <Heart />
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>
           <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingCart />
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login">
              <User className="mr-2" />
              Login / Sign Up
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
