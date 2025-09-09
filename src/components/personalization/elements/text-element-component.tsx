
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
        
        const dynamicHeight = getDynamicHeight(size, element.curve);

        newX = Math.max(constraint.x, Math.min(newX, constraint.x + constraint.width - size.width));
        newY = Math.max(constraint.y, Math.min(newY, constraint.y + constraint.height - dynamicHeight));

        setPosition({ x: newX, y: newY });
    }, [isDragging, canvasRef, size, element.curve, constraintArea]);

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

    const getDynamicHeight = (currentSize: { width: number, height: number }, curve?: number) => {
        const absCurve = Math.abs(curve || 0);
        if (absCurve === 0) return currentSize.height;

        const w = currentSize.width;
        // At max curve (100), we want a perfect semicircle.
        if (absCurve === 100) {
            return Math.max(currentSize.height, w / 2);
        }

        // Map curve from 0-100 to an angle for more intuitive control
        const angle = (absCurve / 100) * 90; // Max 90 degrees curve for full semicircle
        const sagitta = (w / 2) * Math.tan(angle * Math.PI / 360);
        
        return Math.max(currentSize.height, sagitta + currentSize.height * 0.5);
    };


    const dynamicHeight = getDynamicHeight(size, element.curve);

    const getPathData = (curve: number) => {
        const w = size.width;
        const h = dynamicHeight;
        
        if (curve === 0) {
            return `M 0,${h / 2} L ${w},${h / 2}`;
        }
        
        const isDownward = curve < 0;
        const absCurve = Math.abs(curve);
        
        // For a perfect semicircle at max curve
        if (absCurve >= 100) {
            const r = w / 2;
            const sweepFlag = isDownward ? 0 : 1;
            const yPos = isDownward ? r : h - r;
            return `M 0,${yPos} A ${r},${r} 0 0,${sweepFlag} ${w},${yPos}`;
        }

        // Interpolate for other values
        const angle = (absCurve / 100) * 90;
        const sagitta = (w / 2) * Math.tan(angle * Math.PI / 360);
        if(sagitta === 0) return `M 0,${h / 2} L ${w},${h / 2}`;

        const radius = (sagitta / 2) + (w * w) / (8 * sagitta);
        
        if (!isFinite(radius)) {
             return `M 0,${h / 2} L ${w},${h / 2}`;
        }
        
        const sweepFlag = isDownward ? 0 : 1;
        const yPos = isDownward ? (h/2 - sagitta) + sagitta : (h/2 + sagitta) - sagitta;
        
        return `M 0,${yPos} A ${Math.abs(radius)},${Math.abs(radius)} 0 0,${sweepFlag} ${w},${yPos}`;
    }

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
                height: dynamicHeight,
            }}
             onMouseDown={(e) => { e.stopPropagation(); setSelectedElementId(element.id); }}
        >
             <ResizableBox
                width={size.width}
                height={dynamicHeight}
                onResize={(e, {size: newSize}) => setSize({width: newSize.width, height: getDynamicHeight({width: newSize.width, height: size.height}, element.curve)})}
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

    