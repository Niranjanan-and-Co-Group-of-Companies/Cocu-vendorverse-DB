
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product } from '@/lib/products';
import { AlertCircle } from 'lucide-react';

interface PackageAndShippingCardProps {
  weight: number;
  dimensions: { l: number, w: number, h: number };
  inventoryBuffer: number;
  preparationTime: number;
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function PackageAndShippingCard({ weight, dimensions, inventoryBuffer, preparationTime, onFieldChange }: PackageAndShippingCardProps) {
  
  const handleDimensionChange = (dim: 'l' | 'w' | 'h', value: string) => {
    onFieldChange('dimensions', { ...dimensions, [dim]: parseFloat(value) || 0 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logistics & Fulfillment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="preparationTime">Preparation Time (Days)</Label>
            <Input id="preparationTime" type="number" value={preparationTime} onChange={e => onFieldChange('preparationTime', parseInt(e.target.value, 10) || 0)} />
             <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Commit to your prep time. Delays may lead to penalties or order cancellations, as gifts must be timely.
                </AlertDescription>
            </Alert>
        </div>
         <div className="space-y-2">
          <Label htmlFor="inventoryBuffer">Inventory Buffer</Label>
          <Input id="inventoryBuffer" type="number" value={inventoryBuffer} onChange={e => onFieldChange('inventoryBuffer', parseInt(e.target.value, 10))} />
        </div>
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
        <Alert>
            <AlertDescription>
                <strong>Important:</strong> Please provide accurate shipping details. Any price difference due to incorrect information will be deducted from your payout.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

    
