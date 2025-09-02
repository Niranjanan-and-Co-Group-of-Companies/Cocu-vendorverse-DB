'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Briefcase,
  LayoutGrid,
  LogOut,
  Settings,
  Shield,
  Users,
  Gift,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/dashboard/customer', icon: Briefcase, label: 'Customer Portal' },
  { href: '/dashboard/vendor', icon: Users, label: 'Vendor Portal' },
  { href: '/dashboard/admin', icon: Shield, label: 'Admin Portal' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
               <Gift className="h-6 w-6 text-primary" />
              <span className="font-headline">VendorVerse</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={{ children: 'Settings' }}>
                    <Link href="#">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Logout' }}>
                  <Link href="/">
                    <LogOut />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-card md:bg-transparent">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:inline">John Doe</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/id/237/32/32" data-ai-hint="person" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
