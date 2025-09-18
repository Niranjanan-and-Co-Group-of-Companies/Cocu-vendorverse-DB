

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
    weight: number; // in kg
    dimensions: { l: number, w: number, h: number }; // in cm
  };
  preparationTime: { min: number, max: number };
  preparationTimeUnit: 'days' | 'hours';
  onFieldChange: (field: keyof Product, value: any) => void;
  isReviewMode?: boolean;
}

export function PackageAndShippingCard({ 
    packaging, 
    preparationTime,
    preparationTimeUnit,
    onFieldChange,
    isReviewMode = false
}: PackageAndShippingCardProps) {
  
  const handleDimensionChange = (dim: 'l' | 'w' | 'h', value: string) => {
    if (isReviewMode) return;
    const parsedValue = parseFloat(value);
    const dimension = isNaN(parsedValue) ? 0 : parsedValue;

    onFieldChange('packaging', {
        ...packaging,
        dimensions: {
            ...packaging.dimensions,
            [dim]: dimension
        }
    });
  };

  const handleDimensionBlur = (dim: 'l' | 'w' | 'h', value: string) => {
    if (isReviewMode) return;
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue < 0.5 && parsedValue !== 0) {
        handleDimensionChange(dim, '0.5');
    }
  };

  const handleWeightChange = (value: string) => {
      if (isReviewMode) return;
      const parsedValue = parseFloat(value);
      const weight = isNaN(parsedValue) ? 0 : parsedValue;
      
      onFieldChange('packaging', {
          ...packaging,
          weight: weight
      });
  }
  
  const handleWeightBlur = (value: string) => {
      if (isReviewMode) return;
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue) && parsedValue < 0.5 && parsedValue !== 0) {
          onFieldChange('packaging', {
              ...packaging,
              weight: 0.5
          });
      }
  }
  
  const handlePrepTimeChange = (field: 'min' | 'max', value: string) => {
    if (isReviewMode) return;
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
                    readOnly={isReviewMode}
                />
                 <Input 
                    placeholder="Max" 
                    type="number" 
                    value={preparationTime.max} 
                    onChange={e => handlePrepTimeChange('max', e.target.value)} 
                    readOnly={isReviewMode}
                />
                 <Select value={preparationTimeUnit} onValueChange={(value) => onFieldChange('preparationTimeUnit', value)} disabled={isReviewMode}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
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
          <Label htmlFor="weight">Package Weight (kg)</Label>
          <Input 
            id="weight" 
            type="number" 
            step="0.01" 
            value={packaging?.weight || 0} 
            onChange={e => handleWeightChange(e.target.value)}
            onBlur={e => handleWeightBlur(e.target.value)}
            min="0.5"
            readOnly={isReviewMode}
          />
        </div>
        <div className="space-y-2">
            <Label>Package Dimensions (cm)</Label>
            <div className="grid grid-cols-3 gap-2">
                <Input placeholder="L" type="number" step="0.01" value={packaging?.dimensions?.l || 0} onChange={e => handleDimensionChange('l', e.target.value)} onBlur={e => handleDimensionBlur('l', e.target.value)} readOnly={isReviewMode} />
                <Input placeholder="W" type="number" step="0.01" value={packaging?.dimensions?.w || 0} onChange={e => handleDimensionChange('w', e.target.value)} onBlur={e => handleDimensionBlur('w', e.target.value)} readOnly={isReviewMode} />
                <Input placeholder="H" type="number" step="0.01" value={packaging?.dimensions?.h || 0} onChange={e => handleDimensionChange('h', e.target.value)} onBlur={e => handleDimensionBlur('h', e.target.value)} readOnly={isReviewMode} />
            </div>
             <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                    Note: Dimensional value should be greater than or equal to 0.5cm.
                </AlertDescription>
            </Alert>
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
