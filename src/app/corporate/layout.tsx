
'use client';
import CorporateLayoutClient from '@/components/corporate/layout/corporate-layout-client';
import { CorporateAccountProvider } from '@/hooks/use-corporate-account-store';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CorporateAccountProvider>
        <SidebarProvider>
            <CorporateLayoutClient>
                {children}
            </CorporateLayoutClient>
        </SidebarProvider>
    </CorporateAccountProvider>
  );
}
