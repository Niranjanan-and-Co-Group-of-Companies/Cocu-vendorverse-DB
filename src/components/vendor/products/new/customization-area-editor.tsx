
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Square, Circle, Trash2, Move, Grab } from 'lucide-react';
import type { CustomizationArea } from '@/lib/products';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';

interface CustomizationAreaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (areas: CustomizationArea[]) => void;
  imageUrl: string;
  initialAreas: CustomizationArea[];
}


const AreaComponent = ({
    area,
    isSelected,
    onSelect,
    onUpdate,
    canvasRef
}: {
    area: CustomizationArea,
    isSelected: boolean,
    onSelect: (id: string) => void,
    onUpdate: (id: string, newArea: Partial<CustomizationArea>) => void,
    canvasRef: React.RefObject<HTMLDivElement>
}) => {
    const [position, setPosition] = React.useState({x: area.x, y: area.y});
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartPos = React.useRef({x: 0, y: 0});

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(area.id);
        
        const event = 'touches' in e ? e.touches[0] : e;
        dragStartPos.current = {
            x: event.clientX - area.x,
            y: event.clientY - area.y,
        };
        setIsDragging(true);
    };

    const handleDrag = React.useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !canvasRef.current) return;
        const event = 'touches' in e ? e.touches[0] : e;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        let newX = event.clientX - dragStartPos.current.x;
        let newY = event.clientY - dragStartPos.current.y;
        
        newX = Math.max(0, Math.min(newX, canvasRect.width - area.width));
        newY = Math.max(0, Math.min(newY, canvasRect.height - area.height));

        setPosition({ x: newX, y: newY });
    }, [isDragging, canvasRef, area.width, area.height]);

    const handleDragEnd = React.useCallback(() => {
        if (isDragging) {
            onUpdate(area.id, { x: position.x, y: position.y });
            setIsDragging(false);
        }
    }, [isDragging, onUpdate, area.id, position]);

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
        setPosition({x: area.x, y: area.y});
    }, [area.x, area.y]);
    

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={(e) => { e.stopPropagation(); onSelect(area.id); }}
        >
            <ResizableBox
                width={area.width}
                height={area.height}
                onResizeStop={(e, data) => {
                    onUpdate(area.id, { width: data.size.width, height: data.size.height });
                }}
                minConstraints={[50, 50]}
                maxConstraints={[800, 800]}
                resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's']}
                handle={(handle, ref) => (
                    <div
                        ref={ref as any}
                        className={cn(
                            'react-resizable-handle',
                            `react-resizable-handle-${handle}`,
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
                        border: `2px dashed ${isSelected ? 'hsl(var(--primary))' : 'gray'}`,
                        borderRadius: area.type === 'ellipse' ? '50%' : '0',
                        color: area.defaultColor,
                        fontFamily: area.defaultFont,
                        fontSize: `${area.defaultFontSize}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    {area.label}
                </div>
            </ResizableBox>
        </div>
    );
};


export function CustomizationAreaEditor({ isOpen, onClose, onSave, imageUrl, initialAreas }: CustomizationAreaEditorProps) {
  const [areas, setAreas] = React.useState<CustomizationArea[]>(initialAreas);
  const [selectedAreaId, setSelectedAreaId] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setAreas(initialAreas);
    if(initialAreas.length > 0 && !selectedAreaId) {
        setSelectedAreaId(initialAreas[0].id);
    } else if (initialAreas.length === 0) {
        setSelectedAreaId(null);
    }
  }, [initialAreas, isOpen]);

  const addArea = (type: 'rect' | 'ellipse') => {
    const newArea: CustomizationArea = {
      id: `area_${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      label: 'Your Text Here',
      defaultFont: 'Arial',
      defaultFontSize: 24,
      defaultColor: '#000000',
    };
    setAreas([...areas, newArea]);
    setSelectedAreaId(newArea.id);
  };

  const removeArea = (idToRemove: string) => {
      setAreas(currentAreas => currentAreas.filter(a => a.id !== idToRemove));
      if (selectedAreaId === idToRemove) {
          setSelectedAreaId(null);
      }
  };
  
  const updateArea = (id: string, updatedProps: Partial<CustomizationArea>) => {
    setAreas(currentAreas => currentAreas.map(a => a.id === id ? { ...a, ...updatedProps } : a));
  };


  const handleSave = () => {
    onSave(areas);
    onClose();
  };

  const selectedArea = areas.find(a => a.id === selectedAreaId);

  const handleAreaPropChange = (prop: keyof CustomizationArea, value: any) => {
    if (!selectedAreaId) return;
    updateArea(selectedAreaId, { [prop]: value });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Define Customization Area</DialogTitle>
        </DialogHeader>
        <div 
            className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden"
        >
          {/* Canvas */}
          <div className="md:col-span-3 bg-muted rounded-md overflow-hidden relative" ref={canvasRef}>
            {imageUrl && <img src={imageUrl} alt="Product to customize" className="w-full h-full object-contain pointer-events-none" />}
            {areas.map(area => (
              <AreaComponent
                key={area.id}
                area={area}
                isSelected={selectedAreaId === area.id}
                onSelect={setSelectedAreaId}
                onUpdate={updateArea}
                canvasRef={canvasRef}
              />
            ))}
          </div>
          {/* Toolbox & Properties Panel */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
             <div>
                <h3 className="font-semibold mb-2">Tools</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => addArea('rect')}><Square className="mr-2"/> Add Box</Button>
                    <Button variant="outline" onClick={() => addArea('ellipse')}><Circle className="mr-2"/> Add Oval</Button>
                </div>
             </div>
             
             <div className="flex-grow p-4 border rounded-md space-y-4">
               <h3 className="font-semibold">Properties</h3>
              {selectedArea ? (
                <>
                    <div className="space-y-2">
                        <Label>Area Label</Label>
                        <Input value={selectedArea.label} onChange={(e) => handleAreaPropChange('label', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Default Font</Label>
                        <Input value={selectedArea.defaultFont} onChange={(e) => handleAreaPropChange('defaultFont', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label>Font Size</Label>
                            <Input type="number" value={selectedArea.defaultFontSize} onChange={(e) => handleAreaPropChange('defaultFontSize', parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Text Color</Label>
                            <Input type="color" value={selectedArea.defaultColor} onChange={(e) => handleAreaPropChange('defaultColor', e.target.value)} className="p-1"/>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Width and Height are now controlled by dragging the handles on the canvas.</p>

                    <Button variant="destructive" size="sm" onClick={() => removeArea(selectedAreaId!)} className="w-full">
                        <Trash2 className="mr-2"/> Remove Selected Area
                    </Button>
                </>
              ) : (
                <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                    <Move className="h-8 w-8 mb-2" />
                    <p>Select an area on the image to edit its properties, or add a new one.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
