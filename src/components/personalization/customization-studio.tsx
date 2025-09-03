
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { StudioCanvas } from './studio-canvas';
import { StudioLeftPanel } from './studio-left-panel';
import { StudioRightPanel } from './studio-right-panel';

interface CustomizationStudioProps {
  product: Product;
}

export function CustomizationStudio({ product }: CustomizationStudioProps) {
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_320px] h-[calc(100vh-8.5rem)] gap-4 p-4">
      {/* Left Panel */}
      <div className="bg-card rounded-lg border h-full overflow-y-auto">
        <StudioLeftPanel product={product} />
      </div>

      {/* Center Canvas */}
      <div className="h-full flex items-center justify-center">
        <StudioCanvas product={product} />
      </div>

      {/* Right Panel */}
      <div className="bg-card rounded-lg border h-full">
        <StudioRightPanel product={product} />
      </div>
    </div>
  );
}
