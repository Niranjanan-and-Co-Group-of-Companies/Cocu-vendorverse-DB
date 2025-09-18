import * as React from 'react';
import { PersonalizedVendorLayoutClient } from '@/components/layout/personalized-vendor-layout-client';

export default function PersonalizedVendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PersonalizedVendorLayoutClient>{children}</PersonalizedVendorLayoutClient>;
}
