
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
  Gavel,
  FileText,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { VendorNotificationDropdown } from './vendor-notification-dropdown';
import { onVendorConversationsUpdate } from '@/lib/vendor/messages-service';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

// In a real app, this would come from an auth context.
const VENDOR_ID = "vendor001";

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

const PlatformSwitcher = ({ path, children }: { path: string, children: React.ReactNode }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem asChild>
                <Link href={`/vendor/both/${path}/personalized`}>Personalized</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={`/vendor/both/${path}/corporate`}>Corporate</Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

const InventorySwitcher = ({ children }: { children: React.ReactNode }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem asChild>
                <Link href={`/vendor/both/inventory`}>Retail Inventory</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={`/vendor/corporate/inventory`}>Corporate Inventory</Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);


function BothVendorSidebar() {
    const pathname = usePathname();
    const [totalUnreadMessages, setTotalUnreadMessages] = React.useState(0);

    React.useEffect(() => {
        const unsubscribe = onVendorConversationsUpdate(VENDOR_ID, (conversations) => {
            const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
            setTotalUnreadMessages(totalUnread);
        });

        return () => unsubscribe();
    }, []);


    const isActive = (path: string) => {
        return pathname.startsWith(path);
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
                    <Badge variant="outline" className="w-fit">Hybrid Vendor</Badge>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/both/dashboard')} tooltip={{ children: 'Dashboard' }}>
                            <Link href="/vendor/both/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                        <PlatformSwitcher path="products">
                            <SidebarMenuButton isActive={isActive('/vendor/both/products')} tooltip={{ children: 'Products' }}>
                                <Package /><span>Products</span>
                            </SidebarMenuButton>
                        </PlatformSwitcher>
                    </SidebarMenuItem>
                    
                     <SidebarMenuItem>
                        <PlatformSwitcher path="orders">
                            <SidebarMenuButton isActive={isActive('/vendor/both/orders')} tooltip={{ children: 'Orders' }}>
                                <ListChecks /><span>Orders</span>
                            </SidebarMenuButton>
                        </PlatformSwitcher>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <InventorySwitcher>
                            <SidebarMenuButton isActive={isActive('/vendor/both/inventory') || isActive('/vendor/corporate/inventory')} tooltip={{ children: 'Inventory' }}>
                                <Warehouse /><span>Inventory</span>
                            </SidebarMenuButton>
                        </InventorySwitcher>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/both/bids')} tooltip={{ children: 'Bids (Corporate)' }}>
                            <Link href="/vendor/both/bids"><Gavel /><span>Bids</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/both/quotes')} tooltip={{ children: 'Quotes (Corporate)' }}>
                            <Link href="/vendor/both/quotes"><FileText /><span>Quotes</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                     <SidebarMenuItem>
                        <PlatformSwitcher path="analytics">
                            <SidebarMenuButton isActive={isActive('/vendor/both/analytics')} tooltip={{ children: 'Analytics' }}>
                                <LineChart /><span>Analytics</span>
                            </SidebarMenuButton>
                        </PlatformSwitcher>
                    </SidebarMenuItem>
                    
                     <SidebarMenuItem>
                        <PlatformSwitcher path="messages">
                            <SidebarMenuButton isActive={isActive('/vendor/both/messages')} tooltip={{ children: 'Messages' }}>
                                <MessageSquare /><span>Messages</span>
                            </SidebarMenuButton>
                        </PlatformSwitcher>
                        {totalUnreadMessages > 0 && <SidebarMenuBadge>{totalUnreadMessages}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                    
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/both/support')} tooltip={{ children: 'Support' }}>
                            <Link href="/vendor/both/support"><LifeBuoy /><span>Support</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/both/settings')} tooltip={{ children: 'Settings' }}>
                            <Link href="/vendor/both/settings"><Settings /><span>Settings</span></Link>
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


export function BothVendorSidebarLayout({ children }: { children: React.ReactNode; }) {
  const pathname = usePathname();
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard';
  
  const [isVerified] = React.useState(false);

  return (
    <SidebarProvider>
        <BothVendorSidebar />
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
