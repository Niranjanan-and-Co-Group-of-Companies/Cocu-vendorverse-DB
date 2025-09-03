
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Text, ImageIcon, Upload, QrCode, Smile } from 'lucide-react';
import { TextTool } from './tools/text-tool';
import { LayersPanel } from './tools/layers-panel';


interface StudioRightPanelProps {
  product: Product;
}

export function StudioRightPanel({ product }: StudioRightPanelProps) {
  return (
    <Tabs defaultValue="text" className="h-full flex flex-col">
        <div className="p-2">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="text"><Text /></TabsTrigger>
                <TabsTrigger value="ai-image"><ImageIcon /></TabsTrigger>
                <TabsTrigger value="upload"><Upload /></TabsTrigger>
                <TabsTrigger value="qr-code"><QrCode /></TabsTrigger>
                <TabsTrigger value="clipart"><Smile /></TabsTrigger>
            </TabsList>
        </div>
        <div className="flex-grow overflow-y-auto">
            <TabsContent value="text" className="p-0 m-0">
                <TextTool />
            </TabsContent>
            <TabsContent value="ai-image" className="p-4">
                 <h3 className="font-semibold">Generate AI Image</h3>
                 <p className="text-sm text-muted-foreground">AI Image tool coming soon.</p>
            </TabsContent>
            <TabsContent value="upload" className="p-4">
                 <h3 className="font-semibold">Upload Image</h3>
                 <p className="text-sm text-muted-foreground">Image upload tool coming soon.</p>
            </TabsContent>
            <TabsContent value="qr-code" className="p-4">
                 <h3 className="font-semibold">Add QR Code</h3>
                 <p className="text-sm text-muted-foreground">QR Code tool coming soon.</p>
            </TabsContent>
            <TabsContent value="clipart" className="p-4">
                 <h3 className="font-semibold">Add Clipart</h3>
                 <p className="text-sm text-muted-foreground">Clipart library coming soon.</p>
            </TabsContent>
        </div>
        <div className="p-4 border-t">
            <LayersPanel />
        </div>
    </Tabs>
  );
}
