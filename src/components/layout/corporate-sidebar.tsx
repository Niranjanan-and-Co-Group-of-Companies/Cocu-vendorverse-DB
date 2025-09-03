
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Package,
  Gavel,
  Users,
  Settings,
  Home,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ShoppingCart,
  Heart,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCorporateCart } from '@/hooks/use-corporate-cart';
import { useCorporateWishlist } from '@/hooks/use-corporate-wishlist';
import { useComparison } from '@/hooks/use-comparison';


function CustomSidebarTrigger() {
    const { open, toggleSidebar } = useSidebar();
  
    return (
      <Button
        variant={open ? 'outline' : 'default'}
        size="icon"
        onClick={toggleSidebar}
        className="hidden md:flex absolute top-1/2 right-[-14px] -translate-y-1/2 z-20 rounded-full"
      >
        {open ? <ChevronsLeft /> : <ChevronsRight />}
      </Button>
    );
}


export function CorporateSidebar() {
    const pathname = usePathname();
    const { items: cartItems } = useCorporateCart();
    const { items: wishlistItems } = useCorporateWishlist();
    const { items: compareItems } = useComparison();

    const isActive = (path: string) => {
        if (path === '/corporate/dashboard') {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

    return (
        <Sidebar>
            <div className="relative h-full flex flex-col">
              <CustomSidebarTrigger />
              <SidebarHeader className="items-center gap-4">
                <Avatar className="size-8">
                    <AvatarImage src="https://i.pravatar.cc/100?u=corporate-customer" alt="Customer" data-ai-hint="avatar" />
                    <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[state=collapsed]:hidden">
                    <span className="text-base font-semibold">Globex Corp.</span>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/dashboard')} tooltip={{ children: 'Dashboard' }}>
                            <Link href="/corporate/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/products')} tooltip={{ children: 'Products' }}>
                            <Link href="/corporate/products"><Package /><span>Products</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/bids')} tooltip={{ children: 'My Bids' }}>
                            <Link href="/corporate/bids"><Gavel /><span>My Bids</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/cart')} tooltip={{ children: 'Cart' }}>
                            <Link href="/corporate/cart"><ShoppingCart /><span>Cart</span></Link>
                        </SidebarMenuButton>
                        {cartItems.length > 0 && <SidebarMenuBadge>{cartItems.length}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/wishlist')} tooltip={{ children: 'Wishlist' }}>
                            <Link href="#"><Heart /><span>Wishlist</span></Link>
                        </SidebarMenuButton>
                         {wishlistItems.length > 0 && <SidebarMenuBadge>{wishlistItems.length}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/compare')} tooltip={{ children: 'Compare' }}>
                            <Link href="/corporate/compare"><Scale /><span>Compare</span></Link>
                        </SidebarMenuButton>
                         {compareItems.length > 0 && <SidebarMenuBadge>{compareItems.length}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/accounts')} tooltip={{ children: 'Accounts' }}>
                            <Link href="/corporate/accounts"><Users /><span>Accounts</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/settings')} tooltip={{ children: 'Settings' }}>
                            <Link href="/corporate/settings"><Settings /><span>Settings</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>

              <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: 'View Main Site' }}><Link href="/"><Home /><span>View Main Site</span></Link></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: 'Log Out' }}><Link href="/login"><LogOut /><span>Log Out</span></Link></SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </div>
        </Sidebar>
    );
}

// Renaming the existing component to avoid conflicts.
// This component should ideally be removed or refactored if no longer needed.
export function CorporateVendorSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname.startsWith(path);
    };

    return (
        <Sidebar>
            <div className="relative h-full flex flex-col">
              <CustomSidebarTrigger />
              <SidebarHeader className="items-center gap-4">
                <Avatar className="size-8">
                    <AvatarImage src="https://i.pravatar.cc/100?u=vendor-corp" alt="Vendor" data-ai-hint="avatar" />
                    <AvatarFallback>V</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[state=collapsed]:hidden">
                    <span className="text-base font-semibold">Gourmet Delights</span>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/vendor/corporate/dashboard'} tooltip={{ children: 'Dashboard' }}>
                            <Link href="/vendor/corporate/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </div>
        </Sidebar>
    );
}
