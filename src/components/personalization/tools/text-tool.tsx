

'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlusCircle, Italic, Bold } from 'lucide-react';
import type { TextElement } from '@/lib/customization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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
    
    const [content, setContent] = React.useState('');
    const [fontSize, setFontSize] = React.useState(48);
    const [color, setColor] = React.useState('#000000');
    const [fontFamily, setFontFamily] = React.useState(FONT_OPTIONS[0].value);
    const [outlineColor, setOutlineColor] = React.useState('#ffffff');
    const [outlineWidth, setOutlineWidth] = React.useState(0);
    const [curve, setCurve] = React.useState(0);
    const [fontWeight, setFontWeight] = React.useState<number>(400);
    const [fontStyle, setFontStyle] = React.useState<'normal' | 'italic'>('normal');
    
    React.useEffect(() => {
        if (selectedElement) {
            setContent(selectedElement.content);
            setFontSize(selectedElement.fontSize);
            setColor(selectedElement.color);
            setFontFamily(selectedElement.fontFamily);
            setOutlineColor(selectedElement.outlineColor || '#ffffff');
            setOutlineWidth(selectedElement.outlineWidth || 0);
            setCurve(selectedElement.curve || 0);
            setFontWeight(selectedElement.fontWeight || 400);
            setFontStyle(selectedElement.fontStyle || 'normal');
        }
    }, [selectedElementId, selectedElement]);

    const handleAddText = () => {
        addElement({
            type: 'text',
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            content: 'Your Text Here',
            fontFamily: FONT_OPTIONS[0].value,
            fontSize: 15,
            color: '#000000',
            textAlign: 'center',
            fontWeight: 100,
            fontStyle: 'normal',
            textDecoration: 'none',
            rotation: 0,
            opacity: 1,
            locked: false,
            outlineWidth: 0,
            outlineColor: '#ffffff',
            curve: 0,
        });
    };

    const handleUpdate = (prop: keyof TextElement, value: any) => {
        if (selectedElementId) {
            updateElement(selectedElementId, { [prop]: value });
        }
    };
    
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        handleUpdate('content', e.target.value);
    }
    
    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(e.target.value, 10) || 1;
        setFontSize(newSize);
        handleUpdate('fontSize', newSize);
    }
    
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
        handleUpdate('color', e.target.value);
    }
    
    const handleFontChange = (value: string) => {
        setFontFamily(value);
        handleUpdate('fontFamily', value);
    }

    const handleOutlineColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOutlineColor(e.target.value);
        handleUpdate('outlineColor', e.target.value);
    }

    const handleOutlineWidthChange = (value: number[]) => {
        setOutlineWidth(value[0]);
        handleUpdate('outlineWidth', value[0]);
    }
    
    const handleCurveChange = (value: number[]) => {
        setCurve(value[0]);
        handleUpdate('curve', value[0]);
    }

    const handleFontWeightChange = (value: number[]) => {
        const newWeight = value[0];
        setFontWeight(newWeight);
        handleUpdate('fontWeight', newWeight);
    }

    const toggleFontStyle = () => {
        const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
        setFontStyle(newStyle);
        handleUpdate('fontStyle', newStyle);
    }
    
    const toggleFontWeight = () => {
        const newWeight = fontWeight === 700 ? 400 : 700;
        setFontWeight(newWeight);
        handleUpdate('fontWeight', newWeight);
    }


    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                <Button onClick={handleAddText} className="w-full">
                    <PlusCircle className="mr-2" /> Add Text
                </Button>

                {selectedElement && (
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
                        <div>
                            <Label htmlFor="font-family">Font</Label>
                             <div className="flex gap-2">
                                <Select value={fontFamily} onValueChange={handleFontChange}>
                                    <SelectTrigger id="font-family">
                                        <SelectValue placeholder="Select a font" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FONT_OPTIONS.map(font => (
                                            <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                                {font.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={toggleFontWeight}
                                    className={cn(fontWeight === 700 && 'bg-accent')}
                                >
                                    <Bold />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={toggleFontStyle}
                                    className={cn(fontStyle === 'italic' && 'bg-accent')}
                                >
                                    <Italic />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor="font-size">Font Size</Label>
                                <Input 
                                    id="font-size" 
                                    type="number"
                                    value={fontSize}
                                    onChange={handleFontSizeChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="text-color">Color</Label>
                                <Input 
                                    id="text-color" 
                                    type="color"
                                    value={color}
                                    onChange={handleColorChange}
                                    className="p-1 h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <div className="flex justify-between items-center">
                                <Label>Outline</Label>
                                <span className="text-xs text-muted-foreground">{outlineWidth}px</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                     <Slider
                                        value={[outlineWidth]}
                                        onValueChange={handleOutlineWidthChange}
                                        min={0}
                                        max={10}
                                        step={1}
                                    />
                                </div>
                                <div>
                                    <Input 
                                        id="outline-color" 
                                        type="color"
                                        value={outlineColor}
                                        onChange={handleOutlineColorChange}
                                        className="p-1 h-10"
                                        disabled={outlineWidth === 0}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <div className="flex justify-between items-center">
                                <Label>Curve</Label>
                                <span className="text-xs text-muted-foreground">{curve}</span>
                            </div>
                             <Slider
                                value={[curve]}
                                onValueChange={handleCurveChange}
                                min={-100}
                                max={100}
                                step={1}
                            />
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
