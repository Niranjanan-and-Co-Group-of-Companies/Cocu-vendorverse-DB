
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Product, ProductStatus } from '@/lib/products';
import { getCategories, type Category } from '@/lib/categories-service'; // Assuming a service to get categories

interface OrganizeCardProps {
  product: Product;
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function OrganizeCard({ product, onFieldChange }: OrganizeCardProps) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tagInput, setTagInput] = React.useState('');

  React.useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      onFieldChange('tags', [...(product.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onFieldChange('tags', (product.tags || []).filter(tag => tag !== tagToRemove));
  };
  
  // In a real app, this would come from the user's auth context
  const isVerified = false; 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organize</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={product.category}
            onValueChange={(value) => onFieldChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2">
                {(product.tags || []).map(tag => (
                    <div key={tag} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="text-muted-foreground hover:text-foreground">&times;</button>
                    </div>
                ))}
            </div>
            <Input 
                id="tags" 
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
            />
        </div>
        <div className="flex items-center justify-between">
            <Label htmlFor="product-status">Product Status</Label>
            <Switch 
                id="product-status" 
                checked={product.status === 'Live'}
                onCheckedChange={(checked) => onFieldChange('status', checked ? 'Live' : 'Draft')}
                disabled={!isVerified && product.status !== 'Live'}
            />
        </div>
         {!isVerified && (
            <p className="text-xs text-muted-foreground">Product status is locked to 'Draft' until your vendor account is verified.</p>
         )}
      </CardContent>
    </Card>
  );
}

    