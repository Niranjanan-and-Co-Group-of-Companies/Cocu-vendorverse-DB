

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
import { Separator } from '@/components/ui/separator';

interface MediaAndCustomizationCardProps {
  product: Product;
  onFieldChange: (field: keyof Product, value: any) => void;
  onImageChange: (variantId: string, side: CustomizationSide, file: File | null) => void;
  onGalleryFilesChange: (variantId: string, files: File[]) => void;
  galleryImageFilesByVariant: Record<string, File[]>;
  mainVariantId: string | null;
  isReviewMode?: boolean;
}

const SIDES: CustomizationSide[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export function MediaAndCustomizationCard({ 
    product, 
    onFieldChange, 
    onImageChange,
    onGalleryFilesChange,
    galleryImageFilesByVariant,
    mainVariantId,
    isReviewMode = false
}: MediaAndCustomizationCardProps) {
    const [editingSide, setEditingSide] = React.useState<CustomizationSide | null>(null);
    const [activeVariantId, setActiveVariantId] = React.useState<string>(mainVariantId || product.variants?.[0]?.id || '');
    
    React.useEffect(() => {
        if (mainVariantId && product.variants?.some(v => v.id === mainVariantId)) {
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
                    disabled={isReviewMode}
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
                     <h4 className="font-semibold text-lg">Editing Images for: {activeVariant.colorName}</h4>
                     
                     <div className="space-y-2">
                        <Label>Product Gallery for {activeVariant.colorName}</Label>
                        <Alert><AlertDescription>Upload showcase images for this variant. The first image will be the main one if no specific 'front side' image is set for customization.</AlertDescription></Alert>
                         <MultiImageUpload
                            existingImageUrls={activeVariant.galleryImages || []}
                            files={galleryImageFilesByVariant[activeVariantId] || []}
                            onFilesChange={(files) => onGalleryFilesChange(activeVariantId, files)}
                            isReviewMode={isReviewMode}
                         />
                    </div>
                    
                    {isCustomizable && (
                         <>
                            <Separator className="my-6" />
                            <p className="text-sm text-muted-foreground">Upload an image for each side you want customers to be able to customize.</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {SIDES.map(side => (
                                    <div key={side} className="space-y-2">
                                        <Label className="capitalize">{side} Side Image</Label>
                                        <ImageUpload 
                                            imageUrl={activeVariant.customizationSides[side]?.image || undefined}
                                            onFileSelect={(file) => onImageChange(activeVariantId, side, file)}
                                            className="aspect-square"
                                            isReviewMode={isReviewMode}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            disabled={!activeVariant.customizationSides[side]?.image}
                                            onClick={() => handleDefineArea(side)}
                                        >
                                            {isReviewMode ? 'View Area' : 'Define Area'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                </div>
            )}
            
             <div className="space-y-2 pt-6 border-t">
                 <Label htmlFor="videoUrl">YouTube Video URL (Optional)</Label>
                 <p className="text-sm text-muted-foreground">This video will be shown for all variants.</p>
                <Input 
                    id="videoUrl" 
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    value={product.videoUrl}
                    onChange={(e) => onFieldChange('videoUrl', e.target.value)}
                    readOnly={isReviewMode}
                />
             </div>
        </CardContent>
        </Card>
        {isCustomizable && activeVariant && (
            <CustomizationAreaEditor
                isOpen={!!editingSide}
                onClose={() => setEditingSide(null)}
                onSave={handleEditorSave}
                imageUrl={editingSide ? activeVariant.customizationSides[editingSide]?.image || '' : ''}
                initialAreas={editingSide ? product.customizationAreas?.[editingSide] || [] : []}
                isReviewMode={isReviewMode}
            />
        )}
    </>
  );
}
