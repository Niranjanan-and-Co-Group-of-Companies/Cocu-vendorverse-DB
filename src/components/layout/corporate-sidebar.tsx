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
  SidebarMenuBadge,
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
  ShoppingCart,
  Heart,
  Scale,
  MessageSquare,
  PenSquare,
  PackageSearch
} from 'lucide-react';
import { useCorporateCart } from '@/hooks/use-corporate-cart';
import { useComparison } from '@/hooks/use-comparison';
import { useCorporateChat } from '@/hooks/use-corporate-chat-store';


export function CorporateSidebar() {
    const pathname = usePathname();
    const { items: cartItems } = useCorporateCart();
    const { items: compareItems } = useComparison();
    const { conversations } = useCorporateChat();
    const { open, setOpen } = useSidebar();

    const totalUnreadMessages = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

    const isActive = (path: string) => {
        if (path === '/corporate/dashboard' && pathname === path) {
            return true;
        }
        if(path !== '/corporate/dashboard') {
            return pathname.startsWith(path);
        }
        return false;
    };

    return (
        <Sidebar onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <div className="relative h-full flex flex-col">
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
                        <SidebarMenuButton asChild isActive={isActive('/corporate/sourcing-requests')} tooltip={{ children: 'Sourcing Requests' }}>
                            <Link href="/corporate/sourcing-requests"><PackageSearch /><span>Sourcing Requests</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/messages')} tooltip={{ children: 'Messages' }}>
                            <Link href="/corporate/messages"><MessageSquare /><span>Messages</span></Link>
                        </SidebarMenuButton>
                        {totalUnreadMessages > 0 && <SidebarMenuBadge>{totalUnreadMessages}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/corporate/cart')} tooltip={{ children: 'Cart' }}>
                            <Link href="/corporate/cart"><ShoppingCart /><span>Cart</span></Link>
                        </SidebarMenuButton>
                        {cartItems.length > 0 && <SidebarMenuBadge>{cartItems.length}</SidebarMenuBadge>}
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
