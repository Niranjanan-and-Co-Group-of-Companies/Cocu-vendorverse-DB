

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product, CustomizationSide, CustomizationArea, ProductVariant } from '@/lib/products';
import { ImageUpload } from '@/components/common/image-upload';
import { CustomizationAreaEditor } from './customization-area-editor';
import { MultiImageUpload } from '@/components/common/multi-image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MediaAndCustomizationCardProps {
  product: Product;
  onFieldChange: (field: keyof Product, value: any) => void;
  onImageChange: (variantId: string, side: CustomizationSide, file: File | null) => void;
  onGalleryFilesChange: (files: File[]) => void;
  galleryImageFiles: File[];
  mainVariantId: string | null;
}

const SIDES: CustomizationSide[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export function MediaAndCustomizationCard({ 
    product, 
    onFieldChange, 
    onImageChange,
    onGalleryFilesChange,
    galleryImageFiles,
    mainVariantId
}: MediaAndCustomizationCardProps) {
    const [editingSide, setEditingSide] = React.useState<CustomizationSide | null>(null);
    const [activeVariantId, setActiveVariantId] = React.useState<string>(mainVariantId || product.variants?.[0]?.id || '');
    
    React.useEffect(() => {
        // If main variant changes, switch the active editing variant
        if (mainVariantId) {
            setActiveVariantId(mainVariantId);
        } else if (product.variants && product.variants.length > 0) {
            setActiveVariantId(product.variants[0].id);
        }
    }, [mainVariantId, product.variants]);

    const activeVariant = product.variants?.find(v => v.id === activeVariantId);
    
    const handleDefineArea = (side: CustomizationSide) => {
        setEditingSide(side);
    };

    const handleEditorSave = (areas: CustomizationArea[]) => {
        if (editingSide) {
            const updatedAreas = { ...product.customizationAreas, [editingSide]: areas };
            onFieldChange('customizationAreas', updatedAreas);
        }
        setEditingSide(null);
    };

    const isCustomizable = !!product.customizable;
    
  return (
    <>
        <Card>
        <CardHeader>
            <CardTitle>Media & Customization</CardTitle>
            <CardDescription>Upload product images for each variant and define areas for personalization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="is-customizable" 
                    checked={isCustomizable}
                    onCheckedChange={(checked) => onFieldChange('customizable', checked)}
                />
                <Label htmlFor="is-customizable">This product is customizable</Label>
            </div>
            
            {product.variants && product.variants.length > 1 && (
                 <div className="space-y-2">
                    <Label>Select Variant to Edit Images</Label>
                     <Select value={activeVariantId} onValueChange={setActiveVariantId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a variant" />
                        </SelectTrigger>
                        <SelectContent>
                            {product.variants.map(v => (
                                <SelectItem key={v.id} value={v.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: v.colorHex }} />
                                        {v.colorName}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            )}
            
            {activeVariant && (
                <div className="space-y-4 p-4 border rounded-md">
                     <h4 className="font-semibold text-lg">Editing: {activeVariant.colorName}</h4>

                    {isCustomizable ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {SIDES.map(side => (
                                <div key={side} className="space-y-2">
                                    <Label className="capitalize">{side} Side Image</Label>
                                    <ImageUpload 
                                        imageUrl={activeVariant.customizationSides[side]?.image || undefined}
                                        onFileSelect={(file) => onImageChange(activeVariantId, side, file)}
                                        className="aspect-square"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Product Image for {activeVariant.colorName}</Label>
                            <Alert><AlertDescription>Upload the front-facing image for this variant. This will be the main image.</AlertDescription></Alert>
                            <ImageUpload
                                imageUrl={activeVariant.image || undefined}
                                onFileSelect={(file) => onImageChange(activeVariantId, 'front', file)}
                            />
                        </div>
                    )}
                </div>
            )}
            
            <div className="space-y-4 pt-6 border-t">
                 <div>
                    <Label>Additional Gallery Images (Not variant-specific)</Label>
                    <p className="text-sm text-muted-foreground">These images will appear in the product page gallery for all variants.</p>
                     <MultiImageUpload
                        existingImageUrls={product.galleryImages}
                        files={galleryImageFiles}
                        onFilesChange={onGalleryFilesChange}
                     />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="videoUrl">YouTube Video URL (Optional)</Label>
                    <Input 
                        id="videoUrl" 
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        value={product.videoUrl}
                        onChange={(e) => onFieldChange('videoUrl', e.target.value)}
                    />
                 </div>
            </div>
        </CardContent>
        </Card>
    </>
  );
}
