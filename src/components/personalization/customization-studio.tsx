
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { StudioCanvas } from './studio-canvas';
import { StudioLeftPanel } from './studio-left-panel';
import { StudioRightPanel } from './studio-right-panel';
import { ContextualToolbar } from './tools/contextual-toolbar';
import { BottomToolbar } from './tools/bottom-toolbar';

interface CustomizationStudioProps {
  product: Product;
}

export function CustomizationStudio({ product }: CustomizationStudioProps) {
  
  return (
    <>
      {/* Desktop View: 3-panel layout */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr_320px] h-[calc(100vh-8rem)] gap-4 p-4">
        <div className="bg-card rounded-lg border h-full overflow-hidden">
          <StudioLeftPanel product={product} />
        </div>
        <div className="h-full flex items-center justify-center">
          <StudioCanvas product={product} />
        </div>
        <div className="bg-card rounded-lg border h-full overflow-hidden">
          <StudioRightPanel product={product} />
        </div>
      </div>

      {/* Mobile View: Unified layout */}
      <div className="md:hidden h-full flex flex-col">
         <ContextualToolbar />
         <div className="flex-grow flex items-center justify-center p-2 relative overflow-hidden">
             <StudioCanvas product={product} />
         </div>
         <BottomToolbar product={product} />
      </div>
    </>
  );
}
