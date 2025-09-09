
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Italic, Bold, AlignLeft, AlignCenter, AlignRight, Palette, Type, Droplet, Waves } from 'lucide-react';
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

export function TextToolbar() {
    const { updateElement, selectedElementId, elements } = useCustomization();
    const selectedElement = elements.find(el => el.id === selectedElementId && el.type === 'text') as TextElement | undefined;

    if (!selectedElement) {
        return null; // Should not render if a text element is not selected
    }

    const handleUpdate = (prop: keyof TextElement, value: any) => {
        if (selectedElementId) {
            updateElement(selectedElementId, { [prop]: value });
        }
    };
    
    const handleFontStyleToggle = (style: 'bold' | 'italic') => {
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
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon"><Type /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Font</h4>
                            <p className="text-sm text-muted-foreground">Adjust font properties.</p>
                        </div>
                         <div className="space-y-2">
                            <Label>Font Family</Label>
                            <Select value={selectedElement.fontFamily} onValueChange={(value) => handleUpdate('fontFamily', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {FONT_OPTIONS.map(font => (
                                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                            {font.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Font Size</Label>
                            <Input type="number" value={selectedElement.fontSize} onChange={e => handleUpdate('fontSize', parseInt(e.target.value, 10))} />
                        </div>
                        <div className="space-y-2">
                             <Label>Style</Label>
                             <ToggleGroup type="multiple" value={[selectedElement.fontWeight === 700 ? 'bold' : '', selectedElement.fontStyle]} onValueChange={(value) => {
                                 const isBold = value.includes('bold');
                                 const isItalic = value.includes('italic');
                                 handleUpdate('fontWeight', isBold ? 700 : 400);
                                 handleUpdate('fontStyle', isItalic ? 'italic' : 'normal');
                             }}>
                                <ToggleGroupItem value="bold" aria-label="Toggle bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
                                <ToggleGroupItem value="italic" aria-label="Toggle italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon"><Palette /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Color</h4>
                            <p className="text-sm text-muted-foreground">Change text and outline colors.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Text Color</Label>
                                <Input type="color" value={selectedElement.color} onChange={e => handleUpdate('color', e.target.value)} className="p-1 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Outline Color</Label>
                                <Input type="color" value={selectedElement.outlineColor} onChange={e => handleUpdate('outlineColor', e.target.value)} className="p-1 h-10" />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon"><Waves /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                     <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Effects</h4>
                            <p className="text-sm text-muted-foreground">Apply creative effects.</p>
                        </div>
                         <div className="space-y-2">
                            <Label>Outline Width</Label>
                            <Slider value={[selectedElement.outlineWidth || 0]} onValueChange={(val) => handleUpdate('outlineWidth', val[0])} max={10} step={0.5} />
                        </div>
                         <div className="space-y-2">
                            <Label>Curve</Label>
                            <Slider value={[selectedElement.curve || 0]} onValueChange={(val) => handleUpdate('curve', val[0])} min={-100} max={100} step={1} />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}
