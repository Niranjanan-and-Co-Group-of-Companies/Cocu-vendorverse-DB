
'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building,
  Package,
  PlusCircle,
  ShoppingCart,
  Scale,
  Gavel,
  Briefcase,
  FileText,
  User,
  Settings,
  LogOut,
  Gift,
} from 'lucide-react';
import { Badge } from '../ui/badge';

export function CorporateSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/corporate/dashboard' && pathname === path) return true;
        if (path !== '/corporate/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };
    
    // Placeholder hooks - in a real app, these would come from a global state/context
    const useCart = () => ({ itemCount: 3 });
    const useComparison = () => ({ itemCount: 2 });
    const useBidRequest = () => ({ itemCount: 5 });

    const cart = useCart();
    const comparison = useComparison();
    const bidRequest = useBidRequest();

    return (
        <Sidebar>
            <div className="flex h-full flex-col">
                <SidebarHeader className="items-center gap-2">
                     <Gift className="size-7 text-primary" />
                     <div className="flex flex-col group-data-[state=collapsed]:hidden">
                        <span className="text-lg font-headline font-bold">VendorVerse</span>
                        <Badge variant="outline" className="w-fit">Corporate</Badge>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/dashboard')} tooltip={{ children: 'Marketplace' }}>
                                <Link href="/corporate/dashboard"><Building/><span>Marketplace</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/products')} tooltip={{ children: 'Products' }}>
                                <Link href="/corporate/products"><Package/><span>Products</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/bids/new')} tooltip={{ children: 'Create Bid' }}>
                                <Link href="/corporate/bids/new"><PlusCircle/><span>Create Bid</span></Link>
                            </SidebarMenuButton>
                            {bidRequest.itemCount > 0 && <SidebarMenuBadge>{bidRequest.itemCount}</SidebarMenuBadge>}
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/cart')} tooltip={{ children: 'Cart' }}>
                                <Link href="/corporate/cart"><ShoppingCart/><span>Cart</span></Link>
                            </SidebarMenuButton>
                             {cart.itemCount > 0 && <SidebarMenuBadge>{cart.itemCount}</SidebarMenuBadge>}
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/compare')} tooltip={{ children: 'Compare' }}>
                                <Link href="/corporate/compare"><Scale/><span>Compare</span></Link>
                            </SidebarMenuButton>
                             {comparison.itemCount > 0 && <SidebarMenuBadge>{comparison.itemCount}</SidebarMenuBadge>}
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/bids')} tooltip={{ children: 'Active Bids' }}>
                                <Link href="/corporate/bids"><Gavel/><span>Active Bids</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/orders')} tooltip={{ children: 'Order History' }}>
                                <Link href="/corporate/orders"><Briefcase/><span>Order History</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/quotes')} tooltip={{ children: 'My Quotes' }}>
                                <Link href="/corporate/quotes"><FileText/><span>My Quotes</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/account')} tooltip={{ children: 'Account' }}>
                                <Link href="/corporate/account"><User/><span>Account</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/corporate/settings')} tooltip={{ children: 'Settings' }}>
                                <Link href="/corporate/settings"><Settings/><span>Settings</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{ children: 'Log Out' }}>
                                <Link href="/login"><LogOut/><span>Log Out</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </div>
        </Sidebar>
    );
}
