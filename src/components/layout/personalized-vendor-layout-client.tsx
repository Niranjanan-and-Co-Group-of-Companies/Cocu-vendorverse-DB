'use client';

import * as React from 'react';
import { VendorSidebarLayout } from '@/components/layout/vendor-sidebar-layout';
import { TermsUpdateDialog } from '@/components/common/terms-update-dialog';

export function PersonalizedVendorLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VendorSidebarLayout>
      {children}
      <TermsUpdateDialog userType="vendor" />
    </VendorSidebarLayout>
  );
}
