
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Product } from '@/lib/products';

interface PricingAndInventoryCardProps {
  price: string;
  stock: number;
  maxQuantityPerOrder?: number;
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function PricingAndInventoryCard({ price, stock, maxQuantityPerOrder, onFieldChange }: PricingAndInventoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing & Inventory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input 
              id="price" 
              type="number" 
              value={price} 
              onChange={e => onFieldChange('price', e.target.value)} 
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input 
            id="stock" 
            type="number" 
            value={stock} 
            onChange={e => onFieldChange('stock', parseInt(e.target.value, 10))} 
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
          />
        </div>
      </CardContent>
    </Card>
  );
}
