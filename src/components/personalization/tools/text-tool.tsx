
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
            curve: 0,
        });
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (selectedElementId) {
            updateElement(selectedElementId, { content: e.target.value });
        }
    }

    return (
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
                </div>
            )}
        </div>
    );
}
