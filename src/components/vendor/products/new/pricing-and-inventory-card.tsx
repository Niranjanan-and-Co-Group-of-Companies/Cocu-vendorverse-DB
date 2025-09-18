
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Product } from '@/lib/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PricingAndInventoryCardProps {
  price: string;
  stock: number;
  maxQuantityPerOrder?: number;
  discountType?: 'Percentage' | 'Fixed Amount';
  discountValue?: number;
  onFieldChange: (field: keyof Product, value: any) => void;
  isReviewMode?: boolean;
}

export function PricingAndInventoryCard({ 
    price, 
    stock, 
    maxQuantityPerOrder, 
    discountType,
    discountValue,
    onFieldChange,
    isReviewMode = false
}: PricingAndInventoryCardProps) {

  const handleDiscountTypeChange = (value: 'Percentage' | 'Fixed Amount' | 'None') => {
      if (value === 'None') {
          onFieldChange('discountType', undefined);
          onFieldChange('discountValue', undefined);
      } else {
          onFieldChange('discountType', value);
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing & Inventory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input 
              id="price" 
              type="number" 
              value={price} 
              onChange={e => onFieldChange('price', e.target.value)} 
              className="pl-7"
              readOnly={isReviewMode}
            />
          </div>
        </div>

        {/* <div className="space-y-4 rounded-lg border p-4">
             <h4 className="font-medium">Discount (Optional)</h4>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="discount-type">Discount Type</Label>
                    <Select value={discountType || 'None'} onValueChange={handleDiscountTypeChange}>
                        <SelectTrigger id="discount-type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="None">No Discount</SelectItem>
                            <SelectItem value="Percentage">Percentage (%)</SelectItem>
                            <SelectItem value="Fixed Amount">Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="discount-value">Discount Value</Label>
                    <Input 
                        id="discount-value" 
                        type="number" 
                        value={discountValue || ''}
                        onChange={e => onFieldChange('discountValue', parseFloat(e.target.value) || undefined)}
                        disabled={!discountType}
                    />
                </div>
            </div>
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input 
            id="stock" 
            type="number" 
            value={stock} 
            onChange={e => onFieldChange('stock', parseInt(e.target.value, 10))} 
            readOnly={isReviewMode}
          />
        </div>
         <div className="space-y-2">
          <Label htmlFor="maxQuantity">Max Quantity Per Order</Label>
          <Input 
            id="maxQuantity" 
            type="number" 
            value={maxQuantityPerOrder || ''} 
            onChange={e => onFieldChange('maxQuantityPerOrder', parseInt(e.target.value, 10))}
            placeholder="e.g., 10"
            readOnly={isReviewMode}
          />
        </div>
      </CardContent>
    </Card>
  );
}
