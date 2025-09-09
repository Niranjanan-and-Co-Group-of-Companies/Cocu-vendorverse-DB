
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Text, ImageIcon, Upload, QrCode, Smile, Layers } from 'lucide-react';
import { TextTool } from './text-tool';
import { AiImageTool } from './ai-image-tool';
import { UploadTool } from './upload-tool';
import { QrCodeTool } from './qr-code-tool';
import { ClipartTool } from './clipart-tool';
import { LayersPanel } from '../layers-panel';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BottomToolbarProps {
  product: Product;
}

export function BottomToolbar({ product }: BottomToolbarProps) {
  const [openSheet, setOpenSheet] = React.useState<string | null>(null);

  const tools = [
    { type: 'Text', icon: <Text />, content: <TextTool /> },
    { type: 'AI Image', icon: <ImageIcon />, content: <AiImageTool /> },
    { type: 'Image Upload', icon: <Upload />, content: <UploadTool /> },
    { type: 'QR Code', icon: <QrCode />, content: <QrCodeTool /> },
    { type: 'Clipart', icon: <Smile />, content: <ClipartTool /> },
  ].filter(tool => product.allowedCustomizations?.includes(tool.type));

  return (
    <div className="bg-card border-t p-2 flex justify-around items-center">
      {tools.map(tool => (
        <Sheet key={tool.type} open={openSheet === tool.type} onOpenChange={(isOpen) => setOpenSheet(isOpen ? tool.type : null)}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="flex flex-col h-auto p-1">
                    {tool.icon}
                    <span className="text-xs">{tool.type}</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[45vh]">
                <SheetHeader>
                    <SheetTitle>{tool.type} Tool</SheetTitle>
                </SheetHeader>
                 <ScrollArea className="h-[calc(45vh-4rem)]">
                    <div className="py-4">
                        {tool.content}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
      ))}
      <Sheet open={openSheet === 'layers'} onOpenChange={(isOpen) => setOpenSheet(isOpen ? 'layers' : null)}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-auto p-1">
            <Layers />
            <span className="text-xs">Layers</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[45vh]">
          <SheetHeader>
            <SheetTitle>Layers</SheetTitle>
          </SheetHeader>
           <div className="py-4">
            <LayersPanel />
           </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
