
'use client';

import * as React from 'react';
import type { TextElement } from '@/lib/customization';
import { useCustomization } from '@/hooks/use-customization';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';
import type { CustomizationArea } from '@/lib/products';


interface TextElementComponentProps {
    element: TextElement;
    canvasRef: React.RefObject<HTMLDivElement>;
    constraintArea: CustomizationArea | null;
}

export function TextElementComponent({ element, canvasRef, constraintArea }: TextElementComponentProps) {
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
        const canvasRect = canvasRef.current.getBoundingClientRect();

        const constraint = constraintArea ?? { x: 0, y: 0, width: canvasRect.width, height: canvasRect.height };
        
        let newX = event.clientX - dragStartPos.current.x;
        let newY = event.clientY - dragStartPos.current.y;
        
        newX = Math.max(constraint.x, Math.min(newX, constraint.x + constraint.width - size.width));
        newY = Math.max(constraint.y, Math.min(newY, constraint.y + constraint.height - size.height));

        setPosition({ x: newX, y: newY });
    }, [isDragging, canvasRef, size, constraintArea]);

    const handleDragEnd = React.useCallback(() => {
        if (isDragging) {
            updateElement(element.id, { x: position.x, y: position.y });
            setIsDragging(false);
        }
    }, [isDragging, updateElement, element.id, position]);

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
        setSize({width: element.width, height: element.height})
    }, [element.x, element.y, element.width, element.height]);


    const onResizeStop = (event: React.SyntheticEvent, { size: finalSize }: { size: { width: number, height: number }}) => {
        updateElement(element.id, { width: finalSize.width, height: finalSize.height });
    };
    
    const maxConstraints = React.useMemo(() => {
        if (!canvasRef.current) return [Infinity, Infinity];
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const constraint = constraintArea ?? { x: 0, y: 0, width: canvasRect.width, height: canvasRect.height };
        return [
            constraint.width - (position.x - constraint.x),
            constraint.height - (position.y - constraint.y)
        ];
    }, [canvasRef, constraintArea, position]);

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
                onResize={(e, {size: newSize}) => setSize(newSize)}
                onResizeStop={onResizeStop}
                minConstraints={[50, 20]}
                maxConstraints={maxConstraints}
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: element.textAlign,
                        fontFamily: element.fontFamily,
                        fontSize: element.fontSize,
                        fontWeight: element.fontWeight,
                        fontStyle: element.fontStyle,
                        color: element.color,
                        textDecoration: element.textDecoration,
                        WebkitTextStroke: `${element.outlineWidth}px ${element.outlineColor}`,
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    {element.content}
                </div>
            </ResizableBox>
        </div>
    );
}
