

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product } from '@/lib/products';
import { AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PackageAndShippingCardProps {
  packaging: {
    weight: number; // in grams
    dimensions: { l: number, w: number, h: number }; // in cm
  };
  preparationTime: number; // in days
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function PackageAndShippingCard({ 
    packaging, 
    preparationTime, 
    onFieldChange 
}: PackageAndShippingCardProps) {
  
  const handleDimensionChange = (dim: 'l' | 'w' | 'h', value: string) => {
    onFieldChange('packaging', {
        ...packaging,
        dimensions: {
            ...packaging.dimensions,
            [dim]: parseInt(value, 10) || 0
        }
    });
  };

  const handleWeightChange = (value: string) => {
      onFieldChange('packaging', {
          ...packaging,
          weight: parseInt(value, 10) || 0
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logistics & Fulfillment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="prep-time">Preparation Time (Days)</Label>
            <Input 
                id="prep-time"
                placeholder="e.g. 3" 
                type="number" 
                value={preparationTime} 
                onChange={e => onFieldChange('preparationTime', parseInt(e.target.value, 10) || 0)} 
            />
             <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Commit to your prep time. Delays may lead to penalties or order cancellations, as gifts must be timely.
                </AlertDescription>
            </Alert>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Package Weight (grams)</Label>
          <Input id="weight" type="number" value={packaging.weight} onChange={e => handleWeightChange(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label>Package Dimensions (cm)</Label>
            <div className="grid grid-cols-3 gap-2">
                <Input placeholder="L" type="number" value={packaging.dimensions.l} onChange={e => handleDimensionChange('l', e.target.value)} />
                <Input placeholder="W" type="number" value={packaging.dimensions.w} onChange={e => handleDimensionChange('w', e.target.value)} />
                <Input placeholder="H" type="number" value={packaging.dimensions.h} onChange={e => handleDimensionChange('h', e.target.value)} />
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
