
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import type { TextElement } from '@/lib/customization';

export function TextTool() {
    const { addElement, updateElement, selectedElementId, elements } = useCustomization();
    const selectedElement = elements.find(el => el.id === selectedElementId && el.type === 'text') as TextElement | undefined;
    
    const [content, setContent] = React.useState('');
    const [fontSize, setFontSize] = React.useState(24);
    const [color, setColor] = React.useState('#000000');
    
    React.useEffect(() => {
        if (selectedElement) {
            setContent(selectedElement.content);
            setFontSize(selectedElement.fontSize);
            setColor(selectedElement.color);
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
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#000000',
            textAlign: 'center',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            rotation: 0,
            opacity: 1,
            locked: false,
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
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
