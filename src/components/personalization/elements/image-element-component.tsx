
'use client';

import * as React from 'react';
import type { ImageElement } from '@/lib/customization';
import { useCustomization } from '@/hooks/use-customization';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { CustomizationArea } from '@/lib/products';

interface ImageElementComponentProps {
    element: ImageElement;
    canvasRef: React.RefObject<HTMLDivElement>;
    constraintArea: CustomizationArea | null;
}

export function ImageElementComponent({ element, canvasRef, constraintArea }: ImageElementComponentProps) {
    const { updateElement, selectedElementId, setSelectedElementId } = useCustomization();
    const isSelected = selectedElementId === element.id;

    const [position, setPosition] = React.useState({ x: element.x, y: element.y });
    const [size, setSize] = React.useState({ width: element.width, height: element.height });
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartPos = React.useRef({ x: 0, y: 0 });

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedElementId(element.id);
        
        const event = 'touches' in e ? e.touches[0] : e;
        dragStartPos.current = {
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        };
        setIsDragging(true);
    };

    const handleDrag = React.useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !canvasRef.current) return;
        const event = 'touches' in e ? e.touches[0] : e;
        
        let newX = event.clientX - dragStartPos.current.x;
        let newY = event.clientY - dragStartPos.current.y;

        if (constraintArea) {
            newX = Math.max(constraintArea.x, Math.min(newX, constraintArea.x + constraintArea.width - size.width));
            newY = Math.max(constraintArea.y, Math.min(newY, constraintArea.y + constraintArea.height - size.height));
        }
        
        setPosition({ x: newX, y: newY });
    }, [isDragging, canvasRef, size.width, size.height, constraintArea]);

    const handleDragEnd = React.useCallback(() => {
        if (isDragging) {
            updateElement(element.id, { x: position.x, y: position.y });
            setIsDragging(false);
        }
    }, [isDragging, updateElement, element.id, position]);

    const onResize = (event: React.SyntheticEvent, { size: newSize }: { size: { width: number, height: number } }) => {
        let constrainedWidth = newSize.width;
        let constrainedHeight = newSize.height;

        if (constraintArea) {
            constrainedWidth = Math.min(newSize.width, constraintArea.width);
            constrainedHeight = Math.min(newSize.height, constraintArea.height);
        }
        setSize({ width: constrainedWidth, height: constrainedHeight });
    };

    const onResizeStop = (event: React.SyntheticEvent, { size: finalSize }: { size: { width: number, height: number } }) => {
        let constrainedWidth = finalSize.width;
        let constrainedHeight = finalSize.height;

        if (constraintArea) {
            constrainedWidth = Math.min(finalSize.width, constraintArea.width);
            constrainedHeight = Math.min(finalSize.height, constraintArea.height);
        }
        
        updateElement(element.id, { width: constrainedWidth, height: constrainedHeight });
    }

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('touchmove', handleDrag);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchend', handleDragEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDrag, handleDragEnd]);


    React.useEffect(() => {
        setPosition({x: element.x, y: element.y});
        setSize({width: element.width, height: element.height});
    }, [element.x, element.y, element.width, element.height]);
    

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `rotate(${element.rotation}deg)`,
                width: size.width,
                height: size.height,
            }}
             onMouseDown={(e) => { e.stopPropagation(); setSelectedElementId(element.id); }}
        >
             <ResizableBox
                width={size.width}
                height={size.height}
                onResize={onResize}
                onResizeStop={onResizeStop}
                minConstraints={[50, 50]}
                maxConstraints={constraintArea ? [constraintArea.width, constraintArea.height] : [800, 800]}
                lockAspectRatio
                handle={(handle, ref) => (
                    <div
                        ref={ref as any}
                        className={cn(
                           'react-resizable-handle', `react-resizable-handle-${handle}`,
                           'bg-card border-2 border-primary rounded-full w-3 h-3 -m-1.5',
                           isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                )}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        outline: isSelected ? '2px dashed hsl(var(--primary))' : 'none',
                        outlineOffset: '2px',
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <Image 
                        src={element.src}
                        alt="Customization element"
                        fill
                        className="object-contain"
                    />
                </div>
            </ResizableBox>
        </div>
    );
}
