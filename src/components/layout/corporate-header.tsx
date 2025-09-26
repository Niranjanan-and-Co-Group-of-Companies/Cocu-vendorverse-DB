
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, LogOut, User, SeparatorVertical } from 'lucide-react';
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
import { CorporateNotificationDropdown } from './corporate-notification-dropdown';
import { SidebarTrigger } from '../ui/sidebar';
import { Badge } from '../ui/badge';
import { CorporateCartPreview } from './previews/corporate-cart-preview';
import { CorporateComparePreview } from './previews/corporate-compare-preview';
import Image from 'next/image';
import { Separator } from '../ui/separator';


export default function CorporateHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="md:hidden">
             <SidebarTrigger />
        </div>
        
        <Link href="/corporate/dashboard" className="hidden md:flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-sm font-medium ml-4">
             <Image src="/logo.svg" alt="CO&Cu logo" width={120} height={48} className="h-7 w-auto" />
             <Separator orientation="vertical" className="h-4" />
             <span className="font-semibold">Corporate</span>
        </Link>
        
        <div className="flex-1 flex justify-center px-8">
          <div className="w-full max-w-lg relative">
            <Search platform="corporate" />
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-1">
           <CorporateNotificationDropdown />
           <CorporateCartPreview />
           <CorporateComparePreview />
           
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
                    <Link href="/corporate/accounts"><User className="mr-2"/>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/corporate/settings"><Briefcase className="mr-2"/>Company Settings</Link>
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
