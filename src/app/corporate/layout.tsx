
'use client';

import * as React from 'react';

// This is a basic layout for the corporate section.
// It can be expanded later to include a corporate-specific header or sidebar.
export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-background">{children}</div>;
}
