
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Square, Circle, Trash2, Move } from 'lucide-react';
import type { CustomizationArea } from '@/lib/products';

interface CustomizationAreaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (areas: CustomizationArea[]) => void;
  imageUrl: string;
  initialAreas: CustomizationArea[];
}

export function CustomizationAreaEditor({ isOpen, onClose, onSave, imageUrl, initialAreas }: CustomizationAreaEditorProps) {
  const [areas, setAreas] = React.useState<CustomizationArea[]>(initialAreas);
  const [selectedAreaId, setSelectedAreaId] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    setAreas(initialAreas);
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

  const removeArea = () => {
    if (selectedAreaId) {
      setAreas(areas.filter(a => a.id !== selectedAreaId));
      setSelectedAreaId(null);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedAreaId(id);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectedAreaId || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setAreas(currentAreas => currentAreas.map(area => {
        if (area.id === selectedAreaId) {
            return { ...area, x: area.x + dx, y: area.y + dy };
        }
        return area;
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    onSave(areas);
    onClose();
  };

  const selectedArea = areas.find(a => a.id === selectedAreaId);

  const handleAreaPropChange = (prop: keyof CustomizationArea, value: any) => {
    if (!selectedAreaId) return;
    setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, [prop]: value } : a));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Define Customization Area</DialogTitle>
        </DialogHeader>
        <div 
            className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
          {/* Canvas */}
          <div className="md:col-span-3 bg-muted rounded-md overflow-hidden relative" ref={canvasRef}>
            {imageUrl && <img src={imageUrl} alt="Product to customize" className="w-full h-full object-contain" />}
            {areas.map(area => (
              <div
                key={area.id}
                style={{
                  position: 'absolute',
                  left: `${area.x}px`,
                  top: `${area.y}px`,
                  width: `${area.width}px`,
                  height: `${area.height}px`,
                  border: `2px dashed ${selectedAreaId === area.id ? 'blue' : 'gray'}`,
                  borderRadius: area.type === 'ellipse' ? '50%' : '0',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  color: area.defaultColor,
                  fontFamily: area.defaultFont,
                  fontSize: `${area.defaultFontSize}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)'
                }}
                onMouseDown={(e) => handleMouseDown(e, area.id)}
              >
                {area.label}
              </div>
            ))}
          </div>
          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => addArea('rect')}><Square className="mr-2"/> Add Box</Button>
              <Button variant="outline" onClick={() => addArea('ellipse')}><Circle className="mr-2"/> Add Oval</Button>
            </div>
            <div className="flex-grow p-4 border rounded-md space-y-4 overflow-y-auto">
              {selectedArea ? (
                <>
                    <h4 className="font-semibold">Edit Selected Area</h4>
                    <div className="space-y-2">
                        <Label>Label</Label>
                        <Input value={selectedArea.label} onChange={(e) => handleAreaPropChange('label', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Font</Label>
                        <Input value={selectedArea.defaultFont} onChange={(e) => handleAreaPropChange('defaultFont', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label>Font Size</Label>
                            <Input type="number" value={selectedArea.defaultFontSize} onChange={(e) => handleAreaPropChange('defaultFontSize', parseInt(e.target.value, 10))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <Input type="color" value={selectedArea.defaultColor} onChange={(e) => handleAreaPropChange('defaultColor', e.target.value)} className="p-1"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label>Width</Label>
                            <Input type="number" value={selectedArea.width} onChange={(e) => handleAreaPropChange('width', parseInt(e.target.value, 10))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Height</Label>
                            <Input type="number" value={selectedArea.height} onChange={(e) => handleAreaPropChange('height', parseInt(e.target.value, 10))} />
                        </div>
                    </div>

                    <Button variant="destructive" size="sm" onClick={removeArea} className="w-full">
                        <Trash2 className="mr-2"/> Remove Area
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
          <Button onClick={handleSave}>Save Customization Area</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    