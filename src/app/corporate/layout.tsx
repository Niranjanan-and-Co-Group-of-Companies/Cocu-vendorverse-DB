
'use client';

import * as React from 'react';
import CorporateHeader from '@/components/layout/corporate-header';
import Footer from '@/components/layout/footer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CorporateSidebar } from '@/components/layout/corporate-sidebar';
import { GstVerificationDialog } from '@/components/corporate/gst-verification-dialog';
import { ChatSafetyDialog } from '@/components/corporate/messages/chat-safety-dialog';

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <CorporateSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen">
            <CorporateHeader />
            <main className="flex-grow p-4 md:p-6 bg-muted/40 overflow-y-auto">
                {children}
            </main>
            <Footer />
          </div>
        </SidebarInset>
        <GstVerificationDialog />
        <ChatSafetyDialog />
    </SidebarProvider>
  );
}
