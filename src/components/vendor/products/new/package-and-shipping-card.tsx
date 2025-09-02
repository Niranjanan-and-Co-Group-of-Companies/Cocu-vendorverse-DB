
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product } from '@/lib/products';

interface PackageAndShippingCardProps {
  weight: number;
  dimensions: { l: number, w: number, h: number };
  inventoryBuffer: number;
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function PackageAndShippingCard({ weight, dimensions, inventoryBuffer, onFieldChange }: PackageAndShippingCardProps) {
  
  const handleDimensionChange = (dim: 'l' | 'w' | 'h', value: string) => {
    onFieldChange('dimensions', { ...dimensions, [dim]: parseFloat(value) || 0 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package & Shipping</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" type="number" value={weight} onChange={e => onFieldChange('weight', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
            <Label>Dimensions (cm)</Label>
            <div className="grid grid-cols-3 gap-2">
                <Input placeholder="L" type="number" value={dimensions.l} onChange={e => handleDimensionChange('l', e.target.value)} />
                <Input placeholder="W" type="number" value={dimensions.w} onChange={e => handleDimensionChange('w', e.target.value)} />
                <Input placeholder="H" type="number" value={dimensions.h} onChange={e => handleDimensionChange('h', e.target.value)} />
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inventoryBuffer">Inventory Buffer</Label>
          <Input id="inventoryBuffer" type="number" value={inventoryBuffer} onChange={e => onFieldChange('inventoryBuffer', parseInt(e.target.value, 10))} />
        </div>
        <Alert>
            <AlertDescription>
                <strong>Important:</strong> Please provide accurate details. Any price difference in shipping due to incorrect information will be deducted from your payout.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

    