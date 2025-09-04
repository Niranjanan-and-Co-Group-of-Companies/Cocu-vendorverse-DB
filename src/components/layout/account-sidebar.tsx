
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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Package,
  Brush,
  MapPin,
  CreditCard,
  LifeBuoy,
  User,
  Shield,
  FileText,
  Home,
  LogOut,
  MessageSquare
} from 'lucide-react';

export function AccountSidebar() {
    const pathname = usePathname();
    const { setOpen } = useSidebar();

    const isActive = (path: string) => {
        if (path === '/account' && pathname === path) {
            return true;
        }
        if (path !== '/account' && pathname.startsWith(path)) {
            return true;
        }
        return false;
    };

    return (
        <Sidebar onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <div className="relative h-full flex flex-col">
              <SidebarHeader className="items-center gap-4">
                <Avatar className="size-8">
                    <AvatarImage src="https://i.pravatar.cc/100?u=customer" alt="Customer" data-ai-hint="avatar" />
                    <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[state=collapsed]:hidden">
                    <span className="text-base font-semibold">Alex Doe</span>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account')} tooltip={{ children: 'Dashboard' }}>
                            <Link href="/account"><LayoutDashboard /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/orders')} tooltip={{ children: 'My Orders' }}>
                            <Link href="/account/orders"><Package /><span>My Orders</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/designs')} tooltip={{ children: 'Saved Designs' }}>
                            <Link href="/account/designs"><Brush /><span>Saved Designs</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/addresses')} tooltip={{ children: 'Addresses' }}>
                            <Link href="/account/addresses"><MapPin /><span>Addresses</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/payment-methods')} tooltip={{ children: 'Payment Methods' }}>
                            <Link href="/account/payment-methods"><CreditCard /><span>Payment Methods</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/support')} tooltip={{ children: 'Support' }}>
                            <Link href="/account/support"><LifeBuoy /><span>Support</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/settings')} tooltip={{ children: 'Profile Settings' }}>
                            <Link href="/account/settings"><User /><span>Profile Settings</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/security')} tooltip={{ children: 'Security' }}>
                            <Link href="/account/security"><Shield /><span>Security</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/policies')} tooltip={{ children: 'Policies' }}>
                            <Link href="/account/policies"><FileText /><span>Policies</span></Link>
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
