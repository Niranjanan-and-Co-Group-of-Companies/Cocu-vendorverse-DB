
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


    const dynamicHeight = React.useMemo(() => {
        const absCurve = Math.abs(element.curve || 0);
        if (absCurve === 0) return size.height;
        const sagitta = (size.width / 2) * Math.tan(absCurve / 100 * Math.PI / 4);
        return Math.max(size.height, sagitta * 2);
    }, [size.height, size.width, element.curve]);

    const getPathData = (curve: number) => {
        const w = size.width;
        const h = dynamicHeight;
        const curveValue = curve / 100;

        if (curve === 0) {
            return `M 0,${h / 2} L ${w},${h / 2}`;
        }
        
        const isDownward = curveValue < 0;
        const absCurveValue = Math.abs(curveValue);
        const sagitta = (w / 2) * Math.tan(absCurveValue * Math.PI / 4);
        const radius = (sagitta / 2) + (w * w) / (8 * sagitta);
        
        if (!isFinite(radius)) {
             return `M 0,${h / 2} L ${w},${h / 2}`;
        }
        
        const sweepFlag = isDownward ? 0 : 1;
        const yPos = isDownward ? sagitta : h - sagitta;
        
        return `M 0,${yPos} A ${Math.abs(radius)} ${Math.abs(radius)} 0 0 ${sweepFlag} ${w},${yPos}`;
    }

    const onResizeStop = (event: React.SyntheticEvent, { size: finalSize }: { size: { width: number, height: number }}) => {
        let constrainedWidth = finalSize.width;
        let constrainedHeight = finalSize.height;

        if (constraintArea) {
            constrainedWidth = Math.min(finalSize.width, constraintArea.width);
            constrainedHeight = Math.min(finalSize.height, constraintArea.height);
        }
        updateElement(element.id, { width: constrainedWidth, height: constrainedHeight });
    };
    

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `rotate(${element.rotation}deg)`,
                width: size.width,
                height: dynamicHeight,
            }}
             onMouseDown={(e) => { e.stopPropagation(); setSelectedElementId(element.id); }}
        >
             <ResizableBox
                width={size.width}
                height={dynamicHeight}
                onResize={(e, {size: newSize}) => setSize(newSize)}
                onResizeStop={onResizeStop}
                minConstraints={[50, 20]}
                maxConstraints={constraintArea ? [constraintArea.width, constraintArea.height] : [800, 800]}
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
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <svg width="100%" height="100%" viewBox={`0 0 ${size.width} ${dynamicHeight}`}>
                        <defs>
                            <path id={`path-${element.id}`} d={getPathData(element.curve || 0)} />
                        </defs>
                        {isSelected && (
                            <path 
                                d={getPathData(element.curve || 0)} 
                                stroke="hsl(var(--primary))" 
                                strokeWidth="1" 
                                strokeDasharray="3 3"
                                fill="none"
                            />
                        )}
                        <text
                            fill={element.color}
                            fontFamily={element.fontFamily}
                            fontSize={element.fontSize}
                            fontWeight={element.fontWeight}
                            fontStyle={element.fontStyle}
                            paintOrder="stroke"
                            stroke={element.outlineColor}
                            strokeWidth={element.outlineWidth}
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
