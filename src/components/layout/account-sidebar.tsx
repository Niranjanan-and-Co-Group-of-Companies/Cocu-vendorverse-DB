
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Settings
} from 'lucide-react';

export function AccountSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { setOpen } = useSidebar();
    const tab = searchParams.get('tab');

    const isActive = (path: string, isTab: boolean = false) => {
        if (isTab) {
            // For tabs, we check if we are on the base /account page and if the tab matches
            return pathname === '/account' && tab === path;
        }
        // For separate pages, we check the pathname
        return pathname.startsWith(path);
    };

    return (
        <Sidebar onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <div className="relative h-full flex flex-col">
              <SidebarHeader className="items-center gap-4">
                <Avatar className="size-8">
                    <AvatarImage src="https://i.pravatar.cc/100?u=customer" alt="Customer" data-ai-hint="avatar" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[state=collapsed]:hidden">
                    <span className="text-base font-semibold">Alex Doe</span>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('orders', true)} tooltip={{ children: 'My Orders' }}>
                            <Link href="/account?tab=orders"><Package /><span>My Orders</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('designs', true)} tooltip={{ children: 'Saved Designs' }}>
                            <Link href="/account?tab=designs"><Brush /><span>Saved Designs</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('addresses', true)} tooltip={{ children: 'Addresses' }}>
                            <Link href="/account?tab=addresses"><MapPin /><span>Addresses</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('payment-methods', true)} tooltip={{ children: 'Payment Methods' }}>
                            <Link href="/account?tab=payment-methods"><CreditCard /><span>Payment Methods</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('settings', true)} tooltip={{ children: 'Profile Settings' }}>
                            <Link href="/account?tab=settings"><Settings /><span>Profile Settings</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/security')} tooltip={{ children: 'Security' }}>
                            <Link href="/account/security"><Shield /><span>Security</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/account/support')} tooltip={{ children: 'Support' }}>
                            <Link href="/account/support"><LifeBuoy /><span>Support</span></Link>
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
