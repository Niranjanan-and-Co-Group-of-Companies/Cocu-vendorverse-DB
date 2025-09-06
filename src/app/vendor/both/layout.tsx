

import * as React from 'react';
import { BothVendorSidebarLayout } from '@/components/layout/both-vendor-sidebar-layout';
import { TermsUpdateDialog } from '@/components/common/terms-update-dialog';

export default function BothVendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BothVendorSidebarLayout>
      {children}
      <TermsUpdateDialog userType="vendor" />
    </BothVendorSidebarLayout>
  );
}
