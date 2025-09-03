
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QrCode } from 'lucide-react';
import type { QrCodeElement } from '@/lib/customization';

export function QrCodeTool() {
  const { addElement, updateElement, selectedElementId, elements } = useCustomization();
  const selectedElement = elements.find(el => el.id === selectedElementId && el.type === 'qr-code') as QrCodeElement | undefined;
  
  const [value, setValue] = React.useState('');
  const [color, setColor] = React.useState('#000000');
  
  React.useEffect(() => {
    if (selectedElement) {
      setValue(selectedElement.value);
      setColor(selectedElement.color);
    } else {
        setValue('');
        setColor('#000000');
    }
  }, [selectedElementId, selectedElement]);

  const handleAddOrUpdate = () => {
    if (selectedElement) {
        updateElement(selectedElement.id, { value, color });
    } else {
        addElement({
            type: 'qr-code',
            value: value || 'https://vendorverse.com',
            color: color,
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
      </div>

      <Button onClick={handleAddOrUpdate} className="w-full" disabled={!value.trim()}>
        <QrCode className="mr-2" />
        {selectedElement ? 'Update QR Code' : 'Add QR Code'}
      </Button>
    </div>
  );
}
