
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QrCode } from 'lucide-react';
import type { QrCodeElement } from '@/lib/customization';
import { Switch } from '@/components/ui/switch';

export function QrCodeTool() {
  const { addElement, updateElement, selectedElementId, elements } = useCustomization();
  const selectedElement = elements.find(el => el.id === selectedElementId && el.type === 'qr-code') as QrCodeElement | undefined;
  
  const [value, setValue] = React.useState('');
  const [color, setColor] = React.useState('#000000');
  const [hasBackground, setHasBackground] = React.useState(false);
  
  React.useEffect(() => {
    if (selectedElement) {
      setValue(selectedElement.value);
      setColor(selectedElement.color);
      setHasBackground(selectedElement.hasBackground);
    } else {
        setValue('');
        setColor('#000000');
        setHasBackground(false);
    }
  }, [selectedElementId, selectedElement]);

  // Real-time update effect
  React.useEffect(() => {
    if (selectedElement) {
        updateElement(selectedElement.id, { value, color, hasBackground });
    }
  }, [value, color, hasBackground, selectedElement, updateElement]);


  const handleAddOrUpdate = () => {
    if (selectedElement) {
        // Already updated in real-time, this button could just confirm or be removed
        updateElement(selectedElement.id, { value, color, hasBackground });
    } else {
        addElement({
            type: 'qr-code',
            value: value || 'https://vendorverse.com',
            color: color,
            hasBackground: hasBackground,
            x: 50,
            y: 50,
            width: 150,
            height: 150,
            rotation: 0,
            opacity: 1,
            locked: false,
        });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <Label htmlFor="qr-value">URL or Text</Label>
        <Textarea
          id="qr-value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://example.com"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="qr-color">Color</Label>
          <Input
            id="qr-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="p-1 h-10"
          />
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
            <Label htmlFor="qr-background">Background</Label>
            <Switch
                id="qr-background"
                checked={hasBackground}
                onCheckedChange={setHasBackground}
            />
        </div>
      </div>

      <Button onClick={handleAddOrUpdate} className="w-full" disabled={!value.trim() && !selectedElement}>
        <QrCode className="mr-2" />
        {selectedElement ? 'Update QR Code' : 'Add QR Code'}
      </Button>
    </div>
  );
}
