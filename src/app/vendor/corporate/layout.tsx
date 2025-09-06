

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
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuBadge,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Package,
  Gavel,
  FileText,
  LineChart,
  MessageSquare,
  LifeBuoy,
  Settings,
  Home,
  LogOut,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { VendorNotificationDropdown } from '@/components/layout/vendor-notification-dropdown';
import { TermsUpdateDialog } from '@/components/common/terms-update-dialog';

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


function CorporateVendorSidebar() {
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
                    <Badge variant="secondary" className="w-fit">Corporate B2B</Badge>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/vendor/corporate/dashboard'} tooltip={{ children: 'Dashboard' }}>
                            <Link href="/vendor/corporate/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/corporate/products')} tooltip={{ children: 'Products' }}>
                            <Link href="/vendor/corporate/products"><Package /><span>Products</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/corporate/orders')} tooltip={{ children: 'Orders' }}>
                            <Link href="/vendor/corporate/orders"><ListChecks /><span>Orders</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/corporate/bids')} tooltip={{ children: 'Bids' }}>
                            <Link href="/vendor/corporate/bids"><Gavel /><span>Bids</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/corporate/quotes')} tooltip={{ children: 'Quotes' }}>
                            <Link href="/vendor/corporate/quotes"><FileText /><span>Quotes</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/corporate/analytics')} tooltip={{ children: 'Analytics' }}>
                            <Link href="/vendor/corporate/analytics"><LineChart /><span>Analytics</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/corporate/messages')} tooltip={{ children: 'Messages' }}>
                            <Link href="/vendor/corporate/messages"><MessageSquare /><span>Messages</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/corporate/support')} tooltip={{ children: 'Support' }}>
                            <Link href="/vendor/corporate/support"><LifeBuoy /><span>Support</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/vendor/corporate/settings')} tooltip={{ children: 'Settings' }}>
                            <Link href="/vendor/corporate/settings"><Settings /><span>Settings</span></Link>
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


export default function CorporateVendorLayout({ children }: { children: React.ReactNode; }) {
  const pathname = usePathname();
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard';
  
  const [isVerified] = React.useState(false); // Set to false to show the verification prompt

  return (
    <SidebarProvider>
        <CorporateVendorSidebar />
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
                <TermsUpdateDialog userType="vendor" />
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
