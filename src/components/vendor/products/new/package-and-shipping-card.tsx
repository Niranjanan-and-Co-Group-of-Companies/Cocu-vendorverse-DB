

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product } from '@/lib/products';
import { AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PackageAndShippingCardProps {
  packaging: {
    weight: number; // in grams
    dimensions: { l: number, w: number, h: number }; // in cm
  };
  preparationTime: { min: number, max: number };
  preparationTimeUnit: 'days' | 'weeks';
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function PackageAndShippingCard({ 
    packaging, 
    preparationTime,
    preparationTimeUnit,
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
  
  const handlePrepTimeChange = (field: 'min' | 'max', value: string) => {
    onFieldChange('preparationTime', {
        ...preparationTime,
        [field]: parseInt(value, 10) || 0,
    });
  }
  
  const isPrepTimeInvalid = preparationTime && preparationTime.max <= preparationTime.min;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logistics & Fulfillment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label>Preparation Time</Label>
            <div className="flex items-center gap-2">
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
                 <Select value={preparationTimeUnit} onValueChange={(value) => onFieldChange('preparationTimeUnit', value)}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             {isPrepTimeInvalid && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Max prep time must be greater than min prep time.
                    </AlertDescription>
                </Alert>
            )}
             <Alert>
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
