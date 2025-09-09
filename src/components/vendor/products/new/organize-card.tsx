

'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Product, ProductStatus, Platform } from '@/lib/products';
import { onCategoriesWithCommissionsUpdate, type Category, type CategoryPlatform } from '@/lib/categories-service';
import type { Vendor } from '@/lib/vendors-service';

interface OrganizeCardProps {
  product: Product;
  onFieldChange: (field: keyof Product, value: any) => void;
  isAdmin?: boolean;
  vendors?: Vendor[];
}

export function OrganizeCard({ product, onFieldChange, isAdmin = false, vendors = [] }: OrganizeCardProps) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const pathname = usePathname();
  
  const isVendorCorporateFlow = pathname.includes('corporate');
  
  // Determine the effective platform for fetching categories
  const platformForCategoryFetch: CategoryPlatform = React.useMemo(() => {
    if (isAdmin) {
      return product.platform || 'Personalized';
    }
    return isVendorCorporateFlow ? 'Corporate' : 'Personalized';
  }, [isAdmin, product.platform, isVendorCorporateFlow]);

  React.useEffect(() => {
    const unsubscribe = onCategoriesWithCommissionsUpdate(platformForCategoryFetch, setCategories);
    return () => unsubscribe();
  }, [platformForCategoryFetch]);

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
  
  const handleVendorChange = (vendorId: string) => {
    if (vendorId === 'admin') {
      onFieldChange('vendorId', 'admin');
      onFieldChange('vendor', 'VendorVerse');
    } else {
      const selectedVendor = vendors.find(v => v.id === vendorId);
      if (selectedVendor) {
        onFieldChange('vendorId', selectedVendor.id);
        onFieldChange('vendor', selectedVendor.name);
      }
    }
  };
  
  const isVerified = false; 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organize</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdmin && (
           <>
             <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
               <Select 
                  value={product.platform}
                  onValueChange={(value: Platform) => {
                      onFieldChange('platform', value);
                      // Reset category if it's not valid for the new platform
                      onFieldChange('category', '');
                  }}
                >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personalized">Personalized Retail</SelectItem>
                  <SelectItem value="Corporate">Corporate & Bulk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
               <Select 
                  value={product.vendorId}
                  onValueChange={handleVendorChange}
                >
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">VendorVerse (Platform Inventory)</SelectItem>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                        {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
           </>
        )}
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
                    {cat.name} ({cat.commissionRate}%)
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
                disabled={!isVerified && product.status !== 'Live' && !isAdmin}
            />
        </div>
         {!isVerified && !isAdmin && (
            <p className="text-xs text-muted-foreground">Product status is locked to 'Draft' until your vendor account is verified.</p>
         )}
      </CardContent>
    </Card>
  );
}
