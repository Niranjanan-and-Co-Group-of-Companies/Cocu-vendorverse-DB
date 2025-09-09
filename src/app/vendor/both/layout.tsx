
'use client';

import * as React from 'react';
import { BothVendorSidebarLayout } from '@/components/layout/both-vendor-sidebar-layout';

export default function BothVendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BothVendorSidebarLayout>
      {children}
    </BothVendorSidebarLayout>
  );
}
