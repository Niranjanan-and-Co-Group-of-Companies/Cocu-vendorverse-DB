
'use client';

import * as React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
