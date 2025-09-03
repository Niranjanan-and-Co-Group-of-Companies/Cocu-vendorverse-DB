
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import Image from 'next/image';
import { useCustomization } from '@/hooks/use-customization';
import { TextElementComponent } from './elements/text-element-component';
import { ImageElementComponent } from './elements/image-element-component';
import { cn } from '@/lib/utils';

interface StudioCanvasProps {
  product: Product;
}

export function StudioCanvas({ product }: StudioCanvasProps) {
    const canvasRef = React.useRef<HTMLDivElement>(null);
    const { elements, setSelectedElementId } = useCustomization();

    // For now, we'll just display the front image and its areas.
    const activeSide = product.customizationSides.front;
    const activeSideImage = activeSide?.image;
    const customizationAreas = activeSide?.areas || [];

    const handleCanvasClick = (e: React.MouseEvent) => {
        // Deselect if clicking on the canvas background
        if (e.target === canvasRef.current) {
            setSelectedElementId(null);
        }
    }

    return (
        <div 
            className="relative w-full h-full max-w-[80vh] max-h-[80vh] aspect-square bg-muted rounded-lg flex items-center justify-center"
            onClick={handleCanvasClick}
        >
            <div ref={canvasRef} className="relative w-full h-full" style={{ aspectRatio: '1 / 1' }}>
                 {activeSideImage ? (
                    <>
                        <Image
                            src={activeSideImage}
                            alt={`${product.name} - Front View`}
                            fill
                            className="object-contain pointer-events-none"
                            priority
                        />

                        {/* Render vendor-defined customization areas */}
                        {customizationAreas.map(area => (
                            <div
                                key={area.id}
                                className="absolute border-2 border-dashed border-blue-500 pointer-events-none"
                                style={{
                                    left: `${area.x}px`,
                                    top: `${area.y}px`,
                                    width: `${area.width}px`,
                                    height: `${area.height}px`,
                                    borderRadius: area.type === 'ellipse' ? '50%' : '0'
                                }}
                            />
                        ))}

                        {/* Render customization elements */}
                        {elements.map(element => {
                            // For simplicity, we assume all elements are constrained by the first customization area.
                            // A more advanced implementation would associate elements with specific areas.
                            const constraintArea = customizationAreas[0] || null;

                            if (element.type === 'text') {
                                return <TextElementComponent key={element.id} element={element} canvasRef={canvasRef} constraintArea={constraintArea} />
                            }
                            if (element.type === 'ai-image' || element.type === 'image') {
                                return <ImageElementComponent key={element.id} element={element} canvasRef={canvasRef} constraintArea={constraintArea} />
                            }
                            // Add other element types here in the future
                            return null;
                        })}
                    </>
                ) : (
                    <p className="text-muted-foreground">No image for this side.</p>
                )}
            </div>
        </div>
    );
}
