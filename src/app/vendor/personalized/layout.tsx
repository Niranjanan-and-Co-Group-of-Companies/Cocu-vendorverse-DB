
'use client';

import * as React from 'react';
import { VendorSidebarLayout } from '@/components/layout/vendor-sidebar-layout';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';


function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        // Simulate checking for an auth token or session
        const session = sessionStorage.getItem('vendor-auth'); // In a real app, this would be a secure cookie/token
        if (session) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            router.push('/vendor/login'); // Redirect to vendor login if not authenticated
        }
    }, [router]);

    return isAuthenticated;
}


export default function PersonalizedVendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!isAuthenticated) {
    return null; // The hook handles redirection
  }
  
  return (
    <VendorSidebarLayout>
      {children}
    </VendorSidebarLayout>
  );
}
