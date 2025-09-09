
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

interface MediaAndCustomizationCardProps {
  product: Product;
  onFieldChange: (field: keyof Product, value: any) => void;
  onImageChange: (variantId: string, side: CustomizationSide, file: File | null) => void;
  onCustomizationAreaChange: (side: CustomizationSide, areas: CustomizationArea[]) => void;
  onGalleryFilesChange: (files: File[]) => void;
  galleryImageFiles: File[];
}

const SIDES: CustomizationSide[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export function MediaAndCustomizationCard({ 
    product, 
    onFieldChange, 
    onImageChange,
    onCustomizationAreaChange,
    onGalleryFilesChange,
    galleryImageFiles,
}: MediaAndCustomizationCardProps) {
    const [editingSide, setEditingSide] = React.useState<CustomizationSide | null>(null);
    const [activeVariantId, setActiveVariantId] = React.useState<string>(product.variants?.[0]?.id || '');
    
    React.useEffect(() => {
        if (product.variants && product.variants.length > 0 && !product.variants.find(v => v.id === activeVariantId)) {
            setActiveVariantId(product.variants[0].id);
        }
    }, [product.variants, activeVariantId]);

    const activeVariant = product.variants?.find(v => v.id === activeVariantId);
    
    const handleDefineArea = (side: CustomizationSide) => {
        setEditingSide(side);
    };

    const handleEditorSave = (areas: CustomizationArea[]) => {
        if (editingSide) {
            onCustomizationAreaChange(editingSide, areas);
        }
        setEditingSide(null);
    };

    const handleMainVariantImageChange = (file: File | null) => {
        if (!activeVariant) return;

        const updatedVariants = product.variants.map(v => 
            v.id === activeVariantId ? { ...v, image: file ? URL.createObjectURL(file) : null } : v
        );
        onFieldChange('variants', updatedVariants);
        // This is a simplified way to handle file changes; the parent `onImageChange` is now more complex.
        // A real implementation would pass variantId to onImageChange.
        onImageChange(activeVariantId, 'front', file); // Simulate main image as front
    }
    
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
                    checked={product.customizable}
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
                     <div className="space-y-2">
                        <Label>Main Image for {activeVariant.colorName}</Label>
                        <ImageUpload
                            imageUrl={activeVariant.image || undefined}
                            onFileSelect={handleMainVariantImageChange}
                        />
                     </div>

                    {product.customizable && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                            {SIDES.map(side => (
                                <div key={side} className="space-y-2">
                                    <Label className="capitalize">{side} Side Image</Label>
                                    <ImageUpload 
                                        imageUrl={activeVariant.customizationSides[side]?.image || undefined}
                                        onFileSelect={(file) => onImageChange(activeVariantId, side, file)}
                                        className="aspect-square"
                                    />
                                    {activeVariant.customizationSides[side]?.image && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleDefineArea(side)}
                                        >
                                            Define Area
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <div className="space-y-4 pt-6 border-t">
                 <div>
                    <Label>Additional Gallery Images (Not variant-specific)</Label>
                    <p className="text-sm text-muted-foreground">These images will be shown in the product page gallery for all variants.</p>
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

        {editingSide && (
            <CustomizationAreaEditor
                isOpen={!!editingSide}
                onClose={() => setEditingSide(null)}
                onSave={handleEditorSave}
                imageUrl={product.variants?.[0]?.customizationSides[editingSide]?.image || product.variants?.[0]?.image || ''}
                initialAreas={product.customizationAreas[editingSide] || []}
            />
        )}
    </>
  );
}
