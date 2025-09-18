
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/products';

interface ProductDetailsCardProps {
  name: string;
  description: string;
  onFieldChange: (field: keyof Product, value: any) => void;
  isReviewMode?: boolean;
}

export function ProductDetailsCard({ name, description, onFieldChange, isReviewMode = false }: ProductDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
        <CardDescription>Enter the name and description for your product. This will be the same for all variants.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" value={name} onChange={e => onFieldChange('name', e.target.value)} readOnly={isReviewMode} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={e => onFieldChange('description', e.target.value)} rows={5} readOnly={isReviewMode} />
        </div>
      </CardContent>
    </Card>
  );
}
