

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Star } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/products';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';

interface ProductVariantsCardProps {
  variants: ProductVariant[];
  onFieldChange: (field: 'variants', value: ProductVariant[]) => void;
  mainVariantId: string | null;
  onMainVariantChange: (variantId: string) => void;
}

export function ProductVariantsCard({ variants, onFieldChange, mainVariantId, onMainVariantChange }: ProductVariantsCardProps) {

  const handleVariantChange = (index: number, field: keyof Omit<ProductVariant, 'id' | 'image' | 'customizationSides'>, value: string) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    onFieldChange('variants', newVariants);
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant_${Date.now()}`,
      colorName: '',
      colorHex: '#000000',
      image: null,
      customizationSides: {
        front: { image: null }, back: { image: null }, left: { image: null }, right: { image: null }, top: { image: null }, bottom: { image: null }
      }
    };
    onFieldChange('variants', [...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return; // Cannot remove the last variant
    const variantToRemove = variants[index];
    const newVariants = variants.filter((_, i) => i !== index);
    onFieldChange('variants', newVariants);
    // If the removed variant was the main one, set the new first one as main
    if(mainVariantId === variantToRemove.id && newVariants.length > 0) {
        onMainVariantChange(newVariants[0].id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variants</CardTitle>
        <CardDescription>Add color or other variants for your product. Designate one as the main variant for the primary product image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants.map((variant, index) => {
            const isMain = mainVariantId === variant.id;
            return (
              <div key={variant.id} className="flex items-end gap-2 p-3 border rounded-md">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={isMain ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => onMainVariantChange(variant.id)}
                                className="self-center"
                            >
                                <Star className={isMain ? 'text-white fill-white' : ''}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Set as main variant</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`variant-name-${index}`}>Variant Name</Label>
                        <Input
                            id={`variant-name-${index}`}
                            placeholder="e.g., Black"
                            value={variant.colorName}
                            onChange={(e) => handleVariantChange(index, 'colorName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`variant-color-${index}`}>Color</Label>
                        <Input
                            id={`variant-color-${index}`}
                            type="color"
                            value={variant.colorHex}
                            onChange={(e) => handleVariantChange(index, 'colorHex', e.target.value)}
                            className="p-1 h-10"
                        />
                    </div>
                </div>
                {variants.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeVariant(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                )}
              </div>
            )
        })}
        <Button variant="outline" className="w-full" onClick={addVariant}>
          <Plus className="mr-2" /> Add Variant
        </Button>
      </CardContent>
    </Card>
  );
}
