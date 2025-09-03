
'use client';

import * as React from 'react';
import * as icons from 'lucide-react';
import { useCustomization } from '@/hooks/use-customization';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// We can expand this list with more icons from lucide-react or custom SVGs
const CLIPART_CATEGORIES = {
  'Shapes': ['Circle', 'Square', 'Triangle', 'Heart', 'Star'],
  'Objects': ['Award', 'Gift', 'Camera', 'Rocket', 'Briefcase', 'CakeSlice'],
  'Nature': ['Sun', 'Moon', 'Cloud', 'Flower', 'TreePine', 'Leaf'],
  'Symbols': ['Sparkles', 'ThumbsUp', 'PartyPopper', 'Music', 'Mail'],
};

// Create a flat list for searching
const ALL_ICONS = Object.values(CLIPART_CATEGORIES).flat();

const renderIcon = (name: string, props = {}) => {
  const LucideIcon = (icons as any)[name];
  if (LucideIcon) {
    return <LucideIcon {...props} />;
  }
  return null;
};

export function ClipartTool() {
  const { addElement } = useCustomization();
  const { toast } = useToast();
  const [search, setSearch] = React.useState('');

  const handleAddClipart = (name: string) => {
    // To add an SVG as an image, we need to convert it to a data URI
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${(icons as any)[name].displayName === name ? (icons as any)[name]({}).props.children.map((c: any) => c.props.d).join('') : ''}</svg>`;
    const iconNode = renderIcon(name);

    if(!iconNode) return;

    // A simplified way to get SVG paths, might not work for all lucide icons
    const paths = React.Children.map(iconNode.props.children, child => child.props.d)?.join(' ');
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
    const dataUri = `data:image/svg+xml;base64,${btoa(fullSvg)}`;

    addElement({
        type: 'clipart',
        src: dataUri,
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        locked: false,
    });
    toast({
        title: `Added ${name}`,
        description: 'The clipart has been added to your design.'
    });
  };

  const filteredIcons = search
    ? ALL_ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search clipart..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <ScrollArea className="flex-grow">
            <div className="space-y-4 pr-2">
            {search ? (
                <div className="grid grid-cols-4 gap-2">
                    {filteredIcons.map(name => (
                        <Button key={name} variant="outline" className="h-16 flex items-center justify-center" onClick={() => handleAddClipart(name)}>
                            {renderIcon(name, { className: 'h-8 w-8' })}
                        </Button>
                    ))}
                </div>
            ) : (
                Object.entries(CLIPART_CATEGORIES).map(([category, icons]) => (
                    <div key={category}>
                        <h4 className="font-semibold text-sm mb-2">{category}</h4>
                        <div className="grid grid-cols-4 gap-2">
                        {icons.map(name => (
                            <Button key={name} variant="outline" className="h-16 flex items-center justify-center" onClick={() => handleAddClipart(name)}>
                                {renderIcon(name, { className: 'h-8 w-8' })}
                            </Button>
                        ))}
                        </div>
                    </div>
                ))
            )}
            </div>
        </ScrollArea>
    </div>
  );
}
