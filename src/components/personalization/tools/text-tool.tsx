
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlusCircle, Italic, Bold, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { TextElement } from '@/lib/customization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const FONT_OPTIONS = [
    { value: 'var(--font-inter), sans-serif', label: 'Inter' },
    { value: '"Space Grotesk", sans-serif', label: 'Space Grotesk' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Courier New", monospace', label: 'Courier New' },
    { value: '"Brush Script MT", cursive', label: 'Brush Script' },
    { value: 'Impact, sans-serif', label: 'Impact' },
];

export function TextTool() {
    const { addElement, updateElement, selectedElementId, elements } = useCustomization();
    const selectedElement = elements.find(el => el.id === selectedElementId && el.type === 'text') as TextElement | undefined;
    
    // This state is now local to the editing form and applies to the selected element
    const [content, setContent] = React.useState('');
    
    React.useEffect(() => {
        if (selectedElement) {
            setContent(selectedElement.content);
        } else {
            setContent('');
        }
    }, [selectedElement]);

    const handleAddText = () => {
        addElement({
            type: 'text',
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            content: 'Your Text Here',
            fontFamily: FONT_OPTIONS[0].value,
            fontSize: 24,
            color: '#000000',
            textAlign: 'center',
            fontWeight: 400,
            fontStyle: 'normal',
            textDecoration: 'none',
            rotation: 0,
            opacity: 1,
            locked: false,
            outlineWidth: 0,
            outlineColor: '#ffffff',
        });
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (selectedElementId) {
            updateElement(selectedElementId, { content: e.target.value });
        }
    }
    
    const handleUpdate = (prop: keyof TextElement, value: any) => {
        if (selectedElementId) {
            updateElement(selectedElementId, { [prop]: value });
        }
    };
    
    const handleFontStyleToggle = (style: 'bold' | 'italic') => {
        if (!selectedElement) return;
        if (style === 'bold') {
            const newWeight = selectedElement.fontWeight === 700 ? 400 : 700;
            handleUpdate('fontWeight', newWeight);
        }
        if (style === 'italic') {
            const newStyle = selectedElement.fontStyle === 'italic' ? 'normal' : 'italic';
            handleUpdate('fontStyle', newStyle);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <Button onClick={handleAddText} className="w-full">
                <PlusCircle className="mr-2" /> Add Text
            </Button>

            {selectedElement ? (
                <div className="space-y-4 pt-4 border-t">
                    <div>
                        <Label htmlFor="text-content">Text Content</Label>
                        <Textarea 
                            id="text-content" 
                            value={content}
                            onChange={handleContentChange}
                            rows={3}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Font</Label>
                        <Select value={selectedElement.fontFamily} onValueChange={(value) => handleUpdate('fontFamily', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {FONT_OPTIONS.map(font => (
                                    <SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Font Size</Label>
                            <Input type="number" value={selectedElement.fontSize} onChange={e => handleUpdate('fontSize', parseInt(e.target.value, 10))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <Input type="color" value={selectedElement.color} onChange={e => handleUpdate('color', e.target.value)} className="p-1 h-10" />
                        </div>
                     </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Style</Label>
                             <ToggleGroup type="multiple" defaultValue={[selectedElement.fontWeight === 700 ? 'bold' : '', selectedElement.fontStyle]}>
                                <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => handleFontStyleToggle('bold')}><Bold className="h-4 w-4" /></ToggleGroupItem>
                                <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => handleFontStyleToggle('italic')}><Italic className="h-4 w-4" /></ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                     </div>
                      <div className="space-y-2">
                        <Label>Outline</Label>
                        <div className="flex gap-2">
                            <Input type="color" value={selectedElement.outlineColor} onChange={e => handleUpdate('outlineColor', e.target.value)} className="p-1 h-10 w-16" />
                            <Slider value={[selectedElement.outlineWidth || 0]} onValueChange={(val) => handleUpdate('outlineWidth', val[0])} max={10} step={0.5} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label>Rotate</Label>
                        <Slider value={[selectedElement.rotation || 0]} onValueChange={(val) => handleUpdate('rotation', val[0])} min={0} max={360} step={1} />
                     </div>
                </div>
            ) : (
                 <div className="text-center text-muted-foreground pt-4 border-t">
                    <p>Select a text layer to edit its properties.</p>
                </div>
            )}
        </div>
    );
}
