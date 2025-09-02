
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product, CustomizationSide, CustomizationArea } from '@/lib/products';
import { ImageUpload } from '@/components/common/image-upload';
import { CustomizationAreaEditor } from './customization-area-editor';

interface MediaAndCustomizationCardProps {
  product: Product;
  onFieldChange: (field: keyof Product, value: any) => void;
  onImageChange: (side: CustomizationSide, file: File | null) => void;
  onCustomizationAreaChange: (side: CustomizationSide, areas: CustomizationArea[]) => void;
}

const SIDES: CustomizationSide[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export function MediaAndCustomizationCard({ 
    product, 
    onFieldChange, 
    onImageChange,
    onCustomizationAreaChange
}: MediaAndCustomizationCardProps) {
    const [editingSide, setEditingSide] = React.useState<CustomizationSide | null>(null);

    const handleDefineArea = (side: CustomizationSide) => {
        setEditingSide(side);
    };

    const handleEditorSave = (areas: CustomizationArea[]) => {
        if (editingSide) {
            onCustomizationAreaChange(editingSide, areas);
        }
        setEditingSide(null);
    }
    
  return (
    <>
        <Card>
        <CardHeader>
            <CardTitle>Media & Customization</CardTitle>
            <CardDescription>Upload product images and define areas for customer personalization.</CardDescription>
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
            
            {product.customizable && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {SIDES.map(side => (
                        <div key={side} className="space-y-2">
                            <Label className="capitalize">{side} Image</Label>
                            <ImageUpload 
                                imageUrl={product.customizationSides[side]?.image || undefined}
                                onFileSelect={(file) => onImageChange(side, file)}
                                className="aspect-square"
                            />
                            {product.customizationSides[side]?.image && (
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
            
            <div className="space-y-4">
                 <div>
                    <Label>Additional Gallery Images</Label>
                    <p className="text-sm text-muted-foreground">These images will be shown in the product page gallery.</p>
                    {/* Placeholder for multi-image uploader */}
                    <div className="mt-2 p-4 border-2 border-dashed rounded-md text-center text-muted-foreground">
                        Gallery Uploader Coming Soon
                    </div>
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
                imageUrl={product.customizationSides[editingSide]?.image || ''}
                initialAreas={product.customizationSides[editingSide]?.areas || []}
            />
        )}
    </>
  );
}

    