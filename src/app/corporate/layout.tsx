
'use client';
import CorporateLayoutClient from '@/components/corporate/layout/corporate-layout-client';
import { CorporateAccountProvider } from '@/hooks/use-corporate-account-store.tsx';
import { SidebarProvider } from '@/components/ui/sidebar';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        // This would be a real auth check in a production app
        const session = sessionStorage.getItem('user-auth');
        if (session) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            router.push('/login');
        }
    }, [router]);

    return isAuthenticated;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
      return <Skeleton className="h-screen w-full" />;
  }

  if (!isAuthenticated) {
      return null; // Redirect is handled by the hook
  }

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
