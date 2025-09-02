
'use client';

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
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ListChecks,
  LineChart,
  MessageSquare,
  LifeBuoy,
  Settings,
  Home,
  LogOut,
  Bell,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { VendorNotificationDropdown } from './vendor-notification-dropdown';


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

function VendorSidebar() {
    const pathname = usePathname();
    const [unreadMessages, setUnreadMessages] = React.useState(5);

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <Sidebar>
            <div className="relative h-full flex flex-col">
              <CustomSidebarTrigger />
              <SidebarHeader className="items-center gap-4">
                <Avatar className="size-8">
                    <AvatarImage src="https://i.pravatar.cc/100?u=vendor" alt="Vendor" data-ai-hint="avatar" />
                    <AvatarFallback>V</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[state=collapsed]:hidden">
                    <span className="text-base font-semibold">Gourmet Delights</span>
                    <Badge variant="outline" className="w-fit">Personalized Retail</Badge>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/personalized/dashboard')} tooltip={{ children: 'Dashboard' }}>
                            <Link href="/vendor/personalized/dashboard">
                                <LayoutDashboard />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/vendor/personalized/products')} tooltip={{ children: 'Products' }}>
                            <Link href="/vendor/personalized/products">
                                <Package />
                                <span>Products</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/personalized/inventory')} tooltip={{ children: 'Inventory' }}>
                            <Link href="/vendor/personalized/inventory">
                                <Warehouse />
                                <span>Inventory</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/vendor/personalized/orders')} tooltip={{ children: 'Orders' }}>
                            <Link href="/vendor/personalized/orders">
                                <ListChecks />
                                <span>Orders</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/personalized/analytics')} tooltip={{ children: 'Analytics' }}>
                            <Link href="/vendor/personalized/analytics">
                                <LineChart />
                                <span>Analytics</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/personalized/messages')} tooltip={{ children: 'Messages' }}>
                            <Link href="/vendor/personalized/messages">
                                <MessageSquare />
                                <span>Messages</span>
                            </Link>
                        </SidebarMenuButton>
                         {unreadMessages > 0 && <SidebarMenuBadge>{unreadMessages}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/personalized/support')} tooltip={{ children: 'Support' }}>
                            <Link href="/vendor/personalized/support">
                                <LifeBuoy />
                                <span>Support</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/personalized/settings')} tooltip={{ children: 'Settings' }}>
                            <Link href="/vendor/personalized/settings">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>

              <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: 'View Main Site' }}>
                            <Link href="/">
                                <Home />
                                <span>View Main Site</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: 'Log Out' }}>
                            <Link href="/login">
                                <LogOut />
                                <span>Log Out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </div>
        </Sidebar>
    );
}

// This component handles showing the verification prompt without blocking content.
function VerificationFlowHandler({
  isVerified,
  children,
}: {
  isVerified: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {!isVerified && (
        <Alert className="m-4 border-primary/50 text-foreground dark:border-primary rounded-lg">
          <Bell className="h-4 w-4 text-primary" />
          <AlertTitle className="font-bold text-primary">Complete Your Store Setup!</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <div>
              Your store is not yet live. Please complete the verification steps to start selling on the platform.
              Your products will remain as drafts and you cannot receive orders until verification is complete.
            </div>
            <Button asChild size="sm">
                <Link href="#">Continue Verification</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
}


export function VendorSidebarLayout({ children }: { children: React.ReactNode; }) {
  const pathname = usePathname();
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard';
  
  // For now, we simulate the verification status.
  // In a real app, this would come from a user context or API call.
  const [isVerified] = React.useState(false);

  return (
    <SidebarProvider>
        <VendorSidebar />
        <SidebarInset>
            <header className="flex items-center justify-between gap-4 border-b p-2 h-14">
                 <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden"/>
                    <h1 className="font-headline text-lg font-semibold">{pageTitle}</h1>
                 </div>
                 <div className="flex items-center gap-2">
                    <VendorNotificationDropdown />
                 </div>
            </header>
            <main className="flex-1 p-4 md:p-6 bg-muted/40">
                <VerificationFlowHandler isVerified={isVerified}>
                    {children}
                </VerificationFlowHandler>
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
