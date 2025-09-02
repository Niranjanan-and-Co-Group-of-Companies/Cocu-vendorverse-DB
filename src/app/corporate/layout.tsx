
'use client';

import * as React from 'react';
import CorporateHeader from '@/components/layout/corporate-header';
import Footer from '@/components/layout/footer';

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
        <CorporateHeader />
        <main className="flex-grow">
            {children}
        </main>
        <Footer />
    </div>
  );
}
