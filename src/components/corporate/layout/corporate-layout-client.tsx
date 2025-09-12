
'use client';

import * as React from 'react';
import CorporateHeader from '@/components/layout/corporate-header';
import Footer from '@/components/layout/footer';
import { SidebarInset } from '@/components/ui/sidebar';
import { CorporateSidebar } from '@/components/layout/corporate-sidebar';
import { GstVerificationDialog } from '@/components/corporate/gst-verification-dialog';

export default function CorporateLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CorporateSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <CorporateHeader />
          <main className="flex-grow p-4 md:p-6 bg-muted/40">
            {children}
          </main>
          <Footer />
        </div>
      </SidebarInset>
      <GstVerificationDialog />
    </>
  );
}
