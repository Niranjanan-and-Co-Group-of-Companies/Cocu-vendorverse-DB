

'use client';

import * as React from 'react';
import type { TextElement } from '@/lib/customization';
import { useCustomization } from '@/hooks/use-customization';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';


interface TextElementComponentProps {
    element: TextElement;
    canvasRef: React.RefObject<HTMLDivElement>;
}

export function TextElementComponent({ element, canvasRef }: TextElementComponentProps) {
    const { updateElement, selectedElementId, setSelectedElementId } = useCustomization();
    const isSelected = selectedElementId === element.id;

    const [position, setPosition] = React.useState({ x: element.x, y: element.y });
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
        
        let newX = event.clientX - dragStartPos.current.x;
        let newY = event.clientY - dragStartPos.current.y;
        
        newX = Math.max(0, Math.min(newX, canvasRect.width - element.width));
        newY = Math.max(0, Math.min(newY, canvasRect.height - element.height));

        setPosition({ x: newX, y: newY });
    }, [isDragging, canvasRef, element.width, element.height]);

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
    }, [element.x, element.y]);


    // SVG Path generation for curved text
    const getPathData = (curve: number) => {
        const w = element.width;
        if (curve === 0) {
            return `M 0,${element.height / 2} L ${w},${element.height / 2}`;
        }
        const isDownward = curve < 0;
        const absCurve = Math.abs(curve);
        const curveStrength = (100 - absCurve) / 100 * w * 1.5;
        const h = element.height;

        const startX = 0;
        const startY = isDownward ? h / 2 : h / 2 + (absCurve / 100 * h);
        const endX = w;
        const endY = startY;

        const c1X = w / 4;
        const c1Y = isDownward ? h/2 - curveStrength / 10 : h/2 - (absCurve / 100 * h) - curveStrength/10 ;

        const c2X = w * 3 / 4;
        const c2Y = c1Y;
        
        const M = `M ${startX},${startY}`;
        const C = `C ${c1X},${c1Y} ${c2X},${c2Y} ${endX},${endY}`;
        
        return `${M} ${C}`;
    }
    

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `rotate(${element.rotation}deg)`,
                width: element.width,
                height: element.height,
            }}
             onMouseDown={(e) => { e.stopPropagation(); setSelectedElementId(element.id); }}
        >
             <ResizableBox
                width={element.width}
                height={element.height}
                onResizeStop={(e, data) => {
                    updateElement(element.id, { width: data.size.width, height: data.size.height });
                }}
                minConstraints={[50, 20]}
                maxConstraints={[800, 400]}
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
                        border: isSelected ? '1px dashed hsl(var(--primary))' : '1px dashed transparent',
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`}>
                        <defs>
                            <path id={`path-${element.id}`} d={getPathData(element.curve || 0)} />
                        </defs>
                        <text
                            fill={element.color}
                            fontFamily={element.fontFamily}
                            fontSize={element.fontSize}
                            fontWeight={element.fontWeight}
                            fontStyle={element.fontStyle}
                            stroke={element.outlineColor}
                            strokeWidth={element.outlineWidth}
                            letterSpacing="1"
                            paintOrder="stroke"
                            strokeLinejoin="round"
                        >
                            <textPath href={`#path-${element.id}`} startOffset="50%" textAnchor="middle">
                                {element.content}
                            </textPath>
                        </text>
                    </svg>
                </div>
            </ResizableBox>
        </div>
    );
}
