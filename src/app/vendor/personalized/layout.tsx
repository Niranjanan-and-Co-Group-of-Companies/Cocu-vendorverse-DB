
import * as React from 'react';
import { VendorSidebarLayout } from '@/components/layout/vendor-sidebar-layout';

export default function PersonalizedVendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VendorSidebarLayout>
      {children}
    </VendorSidebarLayout>
  );
}
