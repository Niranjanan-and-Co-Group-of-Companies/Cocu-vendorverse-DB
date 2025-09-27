
'use client';

import * as React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        // Simulate checking for a user session
        const session = sessionStorage.getItem('user-auth'); // This would be a real token in a production app
        if (session) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            router.push('/login'); // Redirect to login if not authenticated
        }
    }, [router]);

    return isAuthenticated;
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuth();
  
  if (isAuthenticated === null) {
      return (
          <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow bg-muted/40">
                  <div className="container py-8">
                       <Skeleton className="h-[500px] w-full" />
                  </div>
              </main>
              <Footer />
          </div>
      );
  }

  if (!isAuthenticated) {
      return null; // The hook handles redirection
  }

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-muted/40">
            <div className="container py-8">
                 {children}
            </div>
        </main>
        <Footer />
    </div>
  );
}
