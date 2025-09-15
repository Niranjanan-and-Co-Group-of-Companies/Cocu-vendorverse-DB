
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import Image from 'next/image';
import { useCustomization } from '@/hooks/use-customization';
import { TextElementComponent } from './elements/text-element-component';
import { ImageElementComponent } from './elements/image-element-component';
import { QrCodeElementComponent } from './elements/qr-code-element';
import { cn } from '@/lib/utils';
import { ClipartElement } from '@/lib/customization';

interface StudioCanvasProps {
  product: Product;
}

export function StudioCanvas({ product }: StudioCanvasProps) {
    const internalCanvasRef = React.useRef<HTMLDivElement>(null);
    const { elements, setSelectedElementId, activeSide, selectedVariantId, setCanvasRef } = useCustomization();

    React.useEffect(() => {
        setCanvasRef(internalCanvasRef);
    }, [setCanvasRef]);

    const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
    const sideData = activeVariant?.customizationSides[activeSide];
    
    const activeSideImage = sideData?.image || activeVariant?.image || product.image;
    
    const customizationAreas = product.customizationAreas?.[activeSide] || [];

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === internalCanvasRef.current || (e.target as HTMLElement).id === 'canvas-image-container') {
            setSelectedElementId(null);
        }
    }

    return (
        <div 
            className="relative w-full h-full max-w-[80vh] max-h-[80vh] aspect-square bg-muted rounded-lg flex items-center justify-center"
            onClick={handleCanvasClick}
        >
            <div id="canvas-image-container" ref={internalCanvasRef} className="relative w-full h-full" style={{ aspectRatio: '1 / 1' }}>
                 {activeSideImage ? (
                    <>
                        <Image
                            id="canvas-image"
                            src={activeSideImage}
                            alt={`${product.name} - ${activeSide} View`}
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
                        {elements.filter(el => el.side === activeSide).map(element => {
                            const constraintArea = customizationAreas[0] || null;

                            if (element.type === 'text') {
                                return <TextElementComponent key={element.id} element={element} canvasRef={internalCanvasRef} constraintArea={constraintArea} />
                            }
                            if (element.type === 'ai-image' || element.type === 'image') {
                                return <ImageElementComponent key={element.id} element={element} canvasRef={internalCanvasRef} constraintArea={constraintArea} />
                            }
                             if (element.type === 'qr-code') {
                                return <QrCodeElementComponent key={element.id} element={element} canvasRef={internalCanvasRef} constraintArea={constraintArea} />
                            }
                             if (element.type === 'clipart') {
                                return <ImageElementComponent key={element.id} element={element as ClipartElement} canvasRef={internalCanvasRef} constraintArea={constraintArea} />
                            }
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
