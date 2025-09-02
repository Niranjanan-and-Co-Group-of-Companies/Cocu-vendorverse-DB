
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Briefcase, Building, LogOut, User } from 'lucide-react';
import { Search } from '@/components/search/search';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';


export default function CorporateHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/corporate/dashboard" className="flex items-center gap-2 font-bold text-lg mr-6">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-headline">VendorVerse</span>
        </Link>
        <div className="hidden md:flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-sm font-medium">
             <Briefcase className="h-4 w-4" />
             <span>Corporate</span>
        </div>
        
        <div className="flex-1 flex justify-center px-8">
          <div className="w-full max-w-lg relative">
            <Search />
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-2">
           <Button variant="ghost" asChild>
                <Link href="#">
                    <Building className="mr-2" />
                    Request a Bid
                </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                        <AvatarImage src="https://i.pravatar.cc/100?u=corporate" alt="Corporate User" />
                        <AvatarFallback>B2B</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="#"><User className="mr-2"/>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="#"><Briefcase className="mr-2"/>Company Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/login"><LogOut className="mr-2"/>Logout</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
