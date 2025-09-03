
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Text, ImageIcon, Upload, QrCode, Smile } from 'lucide-react';
import { TextTool } from './tools/text-tool';
import { LayersPanel } from './tools/layers-panel';
import { ScrollArea } from '../ui/scroll-area';
import { AiImageTool } from './tools/ai-image-tool';
import { UploadTool } from './tools/upload-tool';
import { QrCodeTool } from './tools/qr-code-tool';
import { ClipartTool } from './tools/clipart-tool';
import { cn } from '@/lib/utils';


interface StudioRightPanelProps {
  product: Product;
}

export function StudioRightPanel({ product }: StudioRightPanelProps) {
  const availableTools = [
    { type: 'Text', icon: <Text />, content: <TextTool /> },
    { type: 'AI Image', icon: <ImageIcon />, content: <AiImageTool /> },
    { type: 'Image Upload', icon: <Upload />, content: <UploadTool /> },
    { type: 'QR Code', icon: <QrCode />, content: <QrCodeTool /> },
    { type: 'Clipart', icon: <Smile />, content: <ClipartTool /> },
  ].filter(tool => product.allowedCustomizations?.includes(tool.type));

  const gridCols = `grid-cols-${availableTools.length}`;
  const defaultTab = availableTools.length > 0 ? availableTools[0].type.toLowerCase().replace(' ', '-') : '';

  return (
    <div className="h-full flex flex-col">
        {availableTools.length > 0 ? (
            <Tabs defaultValue={defaultTab} className="h-full flex flex-col flex-grow overflow-hidden">
                <div className="p-2">
                    <TabsList className={cn("grid w-full", gridCols)}>
                        {availableTools.map(tool => (
                            <TabsTrigger key={tool.type} value={tool.type.toLowerCase().replace(' ', '-')}>{tool.icon}</TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                <ScrollArea className="flex-grow">
                    {availableTools.map(tool => (
                         <TabsContent key={tool.type} value={tool.type.toLowerCase().replace(' ', '-')} className="p-0 m-0">
                            {tool.content}
                        </TabsContent>
                    ))}
                </ScrollArea>
            </Tabs>
        ) : (
            <div className="p-4 text-center text-muted-foreground">
                This product does not have any customization options enabled.
            </div>
        )}
        <div className="p-4 border-t mt-auto">
            <LayersPanel />
        </div>
    </div>
  );
}
