
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import Image from 'next/image';

interface StudioCanvasProps {
  product: Product;
}

export function StudioCanvas({ product }: StudioCanvasProps) {
    const canvasRef = React.useRef<HTMLDivElement>(null);

    // For now, we'll just display the front image.
    const activeSideImage = product.customizationSides.front?.image;

    return (
        <div className="relative w-full h-full max-w-[80vh] max-h-[80vh] aspect-square bg-muted rounded-lg flex items-center justify-center">
            {activeSideImage ? (
                <div ref={canvasRef} className="relative w-full h-full">
                     <Image
                        src={activeSideImage}
                        alt={`${product.name} - Front View`}
                        fill
                        className="object-contain"
                        priority
                     />
                     {/* Elements will be rendered here */}
                </div>
            ) : (
                <p className="text-muted-foreground">No image for this side.</p>
            )}
        </div>
    );
}
