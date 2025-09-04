
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Heart, User, LogOut } from 'lucide-react';
import { Search } from '@/components/search/search';
import { CartPreview } from './cart-preview';
import { WishlistPreview } from './wishlist-preview';
import { LoginDialog } from './login-dialog';
import { getMockUser, type User as UserType } from '@/lib/user-service';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';


export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserType | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getMockUser().then(userData => {
        setUser(userData);
        setLoading(false);
    });
  }, []);

  
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
           {loading ? (
             <Skeleton className="h-10 w-24" />
           ) : user ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/account"><User className="mr-2"/>Profile & Orders</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><LogOut className="mr-2"/>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
           ) : (
            <Button onClick={() => setIsLoginOpen(true)}>
                <User className="mr-2" />
                Login / Sign Up
            </Button>
           )}
        </nav>
      </div>
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </header>
  );
}
