

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
  preparationTime: { min: number, max: number };
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function PackageAndShippingCard({ weight, dimensions, inventoryBuffer, preparationTime, onFieldChange }: PackageAndShippingCardProps) {
  
  const handleDimensionChange = (dim: 'l' | 'w' | 'h', value: string) => {
    onFieldChange('dimensions', { ...dimensions, [dim]: parseFloat(value) || 0 });
  };
  
  const handlePrepTimeChange = (type: 'min' | 'max', value: string) => {
    onFieldChange('preparationTime', { ...preparationTime, [type]: parseInt(value, 10) || 0 });
  };

  const isPrepTimeInvalid = preparationTime.max !== preparationTime.min + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logistics & Fulfillment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label>Preparation Time (Days)</Label>
            <div className="grid grid-cols-2 gap-2">
                <Input 
                    placeholder="Min" 
                    type="number" 
                    value={preparationTime.min} 
                    onChange={e => handlePrepTimeChange('min', e.target.value)} 
                />
                <Input 
                    placeholder="Max" 
                    type="number" 
                    value={preparationTime.max} 
                    onChange={e => handlePrepTimeChange('max', e.target.value)} 
                />
            </div>
             {isPrepTimeInvalid && (
                 <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="text-xs">
                        Max days must be exactly one greater than min days (e.g., 4-5 days).
                    </AlertDescription>
                </Alert>
             )}
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

    
