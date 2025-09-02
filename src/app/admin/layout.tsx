
'use client';

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
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  LogOut,
  LayoutDashboard,
  Users,
  Box,
  ShoppingCart,
  Building,
  FileText,
  DollarSign,
  Megaphone,
  ShieldAlert,
  UserCog,
  Settings,
  PlusCircle,
  HelpCircle,
  BarChart,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';

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

function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/admin' && pathname === path) {
        return true;
        }
        if (path !== '/admin' && pathname.startsWith(path)) {
        return true;
        }
        return false;
    };

    return (
        <Sidebar>
            <div className="relative h-full">
              <CustomSidebarTrigger />
              <SidebarHeader className="items-center gap-4">
              <Avatar className="size-8">
                  <AvatarImage src="https://picsum.photos/100" alt="Admin" data-ai-hint="avatar" />
                  <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <span className="text-base font-semibold">Admin</span>
              </SidebarHeader>

              <SidebarContent>
              <div className="flex flex-col gap-2 px-2">
                  <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/orders/new">
                      <PlusCircle />
                      <span>New Order</span>
                  </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/marketing/new">
                      <PlusCircle />
                      <span>New Campaign</span>
                  </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/corporate/new-campaign">
                      <PlusCircle />
                      <span>New Corporate Campaign</span>
                  </Link>
                  </Button>
              </div>

              <SidebarMenu>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin')} tooltip={{ children: 'Dashboard' }}>
                      <Link href="/admin">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/vendors')} tooltip={{ children: 'Vendors' }}>
                      <Link href="/admin/vendors">
                      <Users />
                      <span>Vendors</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/products')} tooltip={{ children: 'Products' }}>
                      <Link href="/admin/products">
                      <Box />
                      <span>Products</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/categories')} tooltip={{ children: 'Categories' }}>
                      <Link href="/admin/categories">
                      <BarChart />
                      <span>Categories</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/orders')} tooltip={{ children: 'Orders' }}>
                      <Link href="/admin/orders">
                      <ShoppingCart />
                      <span>Orders</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/corporate')} tooltip={{ children: 'Corporate' }}>
                      <Link href="/admin/corporate">
                      <Building />
                      <span>Corporate</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/content')} tooltip={{ children: 'Content' }}>
                      <Link href="/admin/content">
                      <FileText />
                      <span>Content</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/financials')} tooltip={{ children: 'Financials' }}>
                      <Link href="/admin/financials">
                      <DollarSign />
                      <span>Financials</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/marketing')} tooltip={{ children: 'Marketing' }}>
                      <Link href="/admin/marketing">
                      <Megaphone />
                      <span>Marketing</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/support')} tooltip={{ children: 'Support' }}>
                      <Link href="/admin/support">
                      <HelpCircle />
                      <span>Support</span>
                      </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/moderation')} tooltip={{ children: 'Moderation' }}>
                      <Link href="/admin/moderation">
                      <ShieldAlert />
                      <span>Moderation</span>
                      </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>8</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/users')} tooltip={{ children: 'Users' }}>
                      <Link href="/admin/users">
                      <UserCog />
                      <span>Users</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin/settings')} tooltip={{ children: 'Settings' }}>
                      <Link href="/admin/settings">
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
                  <SidebarMenuButton asChild tooltip={{ children: 'Homepage' }}>
                      <Link href="/">
                      <Home />
                      <span>Homepage</span>
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
            <header className="flex items-center gap-4 border-b p-2">
                <SidebarTrigger className="md:hidden"/>
                <h1 className="font-headline text-lg font-semibold">{pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}
