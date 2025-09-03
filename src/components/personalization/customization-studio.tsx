
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { StudioCanvas } from './studio-canvas';
import { StudioLeftPanel } from './studio-left-panel';
import { StudioRightPanel } from './studio-right-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brush, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CustomizationStudioProps {
  product: Product;
}

export function CustomizationStudio({ product }: CustomizationStudioProps) {
  
  return (
    <>
      {/* Desktop View: 3-panel layout */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr_320px] h-full gap-4 p-4">
        {/* Left Panel */}
        <div className="bg-card rounded-lg border h-full overflow-hidden">
          <StudioLeftPanel product={product} />
        </div>

        {/* Center Canvas */}
        <div className="h-full flex items-center justify-center">
          <StudioCanvas product={product} />
        </div>

        {/* Right Panel */}
        <div className="bg-card rounded-lg border h-full overflow-hidden">
          <StudioRightPanel product={product} />
        </div>
      </div>

      {/* Mobile View: Tabbed interface */}
      <div className="md:hidden h-full flex flex-col">
        <Tabs defaultValue="canvas" className="flex-grow flex flex-col overflow-hidden">
           <TabsContent value="product" className="flex-grow overflow-y-auto p-4">
              <StudioLeftPanel product={product} />
           </TabsContent>
           <TabsContent value="canvas" className="flex-grow flex items-center justify-center p-2">
              <StudioCanvas product={product} />
           </TabsContent>
           <TabsContent value="tools" className="flex-grow overflow-y-auto">
              <StudioRightPanel product={product} />
           </TabsContent>

          <div className="border-t mt-auto">
            <TabsList className="grid w-full grid-cols-3 h-16 rounded-none">
              <TabsTrigger value="product" className="h-full flex-col gap-1">
                <ImageIcon className="h-5 w-5"/>
                <span>Product</span>
              </TabsTrigger>
              <TabsTrigger value="canvas" className="h-full flex-col gap-1">
                 <Sparkles className="h-5 w-5"/>
                 <span>Design</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="h-full flex-col gap-1">
                 <Brush className="h-5 w-5"/>
                 <span>Tools</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </>
  );
}
