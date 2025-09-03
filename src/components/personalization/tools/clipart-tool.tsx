
'use client';

import * as React from 'react';
import * as icons from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useCustomization } from '@/hooks/use-customization';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ClipartElement } from '@/lib/customization';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// We can expand this list with more icons from lucide-react or custom SVGs
const CLIPART_CATEGORIES = {
  'Holidays & Events': ['CakeSlice', 'PartyPopper', 'Gift', 'Heart', 'Star', 'Trophy', 'Award', 'CalendarDays', 'Anniversary', 'Baby', 'GraduationCap', 'Church'],
  'Family & People': ['Users', 'User', 'Home', 'PersonStanding', 'Smile', 'Frown', 'Laugh', 'Handshake', 'HeartHandshake'],
  'School & Office': ['School', 'Book', 'Pencil', 'Notebook', 'Briefcase', 'PenTool', 'Clipboard', 'Printer', 'FileText'],
  'Animals': ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Turtle', 'PawPrint', 'Bone', 'Squirrel'],
  'Nature': ['Sun', 'Moon', 'Cloud', 'Flower', 'TreePine', 'Leaf', 'Mountain', 'Waves', 'Wind', 'Sprout', 'Feather'],
  'Food & Drink': ['Pizza', 'Coffee', 'IceCream', 'Cookie', 'CupSoda', 'Apple', 'Sandwich', 'Wine', 'Beer', 'Utensils'],
  'Travel & Places': ['Plane', 'Sailboat', 'Map', 'Globe', 'Hotel', 'Train', 'Caravan', 'Compass', 'Luggage', 'Pyramid'],
  'Automotive': ['Car', 'Wrench', 'Truck', 'Bike', 'Bus', 'Fuel', 'Tractor', 'ParkingCircle'],
  'Music & Audio': ['Music', 'Guitar', 'Mic', 'Headphones', 'Volume2', 'Play', 'Pause', 'Radio', 'Speaker'],
  'Sports': ['Swords', 'Goal', 'Dumbbell', 'Football', 'Basketball', 'Baseball', 'Medal', 'Skate', 'Surfboard'],
  'Technology': ['Laptop', 'Smartphone', 'Gamepad2', 'MousePointer', 'Keyboard', 'Camera', 'Tablet', 'HardDrive'],
  'Weather': ['CloudSun', 'CloudRain', 'CloudSnow', 'CloudLightning', 'Thermometer', 'Sunrise', 'Sunset'],
  'Shapes & Symbols': ['Circle', 'Square', 'Triangle', 'Hexagon', 'Diamond', 'Sparkles', 'ThumbsUp', 'Mail', 'Check', 'X', 'Info'],
};

// Create a flat list for searching
const ALL_ICONS = Object.values(CLIPART_CATEGORIES).flat().filter((value, index, self) => self.indexOf(value) === index);


const renderIcon = (name: string, props = {}) => {
  const LucideIcon = (icons as any)[name];
  if (LucideIcon) {
    return <LucideIcon {...props} />;
  }
  return null;
};

export function ClipartTool() {
  const { elements, selectedElementId, addElement, updateElement } = useCustomization();
  const { toast } = useToast();
  const [search, setSearch] = React.useState('');

  const selectedClipart = elements.find(el => el.id === selectedElementId && el.type === 'clipart') as ClipartElement | undefined;

  const handleUpdate = (prop: keyof ClipartElement, value: any) => {
    if (selectedElementId) {
        updateElement(selectedElementId, { [prop]: value });
    }
  };

  const handleAddClipart = (name: string, color = '#000000', strokeWidth = 2) => {
    const iconNode = renderIcon(name, {
        xmlns: "http://www.w3.org/2000/svg",
        width: "100",
        height: "100",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    });

    if (!iconNode) {
        toast({ title: 'Error', description: 'Could not render this icon.', variant: 'destructive' });
        return;
    }

    const svgString = renderToStaticMarkup(iconNode);
    const dataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;

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
        color: color,
        strokeWidth: strokeWidth,
    });
    toast({
        title: `Added ${name}`,
        description: 'The clipart has been added to your design.'
    });
  };
  
  React.useEffect(() => {
    if(selectedClipart) {
        // Re-render SVG with new props
         const iconName = selectedClipart.src.split('alt="')[1]?.split('"')[0] || '';
         const iconNode = renderIcon(iconName, {
            xmlns: "http://www.w3.org/2000/svg",
            width: "100",
            height: "100",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: selectedClipart.color,
            strokeWidth: selectedClipart.strokeWidth,
            strokeLinecap: "round",
            strokeLinejoin: "round",
        });

        if (iconNode) {
            const svgString = renderToStaticMarkup(iconNode);
            const dataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;
            if (selectedClipart.src !== dataUri) {
                updateElement(selectedClipart.id, { src: dataUri });
            }
        }
    }
  }, [selectedClipart?.color, selectedClipart?.strokeWidth]);


  const filteredIcons = search
    ? ALL_ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
        {selectedClipart && (
            <div className="pb-4 border-b space-y-4">
                <h3 className="font-semibold text-sm px-1">Clipart Style</h3>
                <div className="space-y-2">
                    <Label htmlFor="clipart-color">Color</Label>
                    <Input 
                        id="clipart-color" 
                        type="color" 
                        className="p-1 h-10" 
                        value={selectedClipart.color}
                        onChange={(e) => handleUpdate('color', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Stroke Width</Label>
                    <Slider 
                        value={[selectedClipart.strokeWidth]}
                        onValueChange={(value) => handleUpdate('strokeWidth', value[0])}
                        min={0.5} max={5} step={0.25}
                    />
                </div>
            </div>
        )}
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
