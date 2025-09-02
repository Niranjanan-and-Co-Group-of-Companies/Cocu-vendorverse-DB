import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Heart, ShoppingCart, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-6">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-headline">VendorVerse</span>
        </Link>
        
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-lg relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for gifts, vendors, and more..."
              className="pl-10 h-9"
            />
          </div>
        </div>

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
