
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, Lock, Unlock, Trash2, Text, Image as ImageIcon, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LayersPanel() {
    const { elements, selectedElementId, setSelectedElementId, removeElement, updateElement, duplicateElement } = useCustomization();

    const handleToggleLock = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const element = elements.find(el => el.id === id);
        if(element) {
            updateElement(id, { locked: !element.locked });
        }
    };
    
    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        removeElement(id);
    };

    const handleDuplicate = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        duplicateElement(id);
    }

    const getIconForType = (type: string) => {
        switch(type) {
            case 'text': return <Text className="h-4 w-4" />;
            case 'image': return <ImageIcon className="h-4 w-4" />;
            default: return <div className="w-4 h-4" />;
        }
    }

    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-sm px-1">Layers</h3>
            <ScrollArea className="h-32">
                <div className="space-y-1 pr-2">
                {elements.length > 0 ? (
                    [...elements].reverse().map(element => (
                        <div
                            key={element.id}
                            className={cn(
                                "flex items-center justify-between p-2 rounded-md cursor-pointer",
                                selectedElementId === element.id ? "bg-accent" : "hover:bg-accent/50"
                            )}
                            onClick={() => setSelectedElementId(element.id)}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {getIconForType(element.type)}
                                <span className="text-sm truncate">
                                    {element.type === 'text' ? element.content : 'Image'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleDuplicate(e, element.id)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleToggleLock(e, element.id)}>
                                    {element.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => handleDelete(e, element.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground text-xs py-8">
                        No layers yet.
                    </div>
                )}
                </div>
            </ScrollArea>
        </div>
    );
}
