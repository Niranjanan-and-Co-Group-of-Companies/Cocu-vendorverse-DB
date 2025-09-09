
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
  creatorStory?: string;
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function ProductDetailsCard({ name, description, creatorStory, onFieldChange }: ProductDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
        <CardDescription>Enter the name, description, and story for your product. This will be the same for all variants.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" value={name} onChange={e => onFieldChange('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={e => onFieldChange('description', e.target.value)} rows={5} />
        </div>
         <div className="space-y-2">
          <Label htmlFor="creator-story">Creator Story (Optional)</Label>
          <Textarea id="creator-story" value={creatorStory || ''} onChange={e => onFieldChange('creatorStory', e.target.value)} rows={3} placeholder="Share the inspiration or process behind your creation."/>
        </div>
      </CardContent>
    </Card>
  );
}
