

'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductById, saveProduct, type Product } from '@/lib/products-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save, UploadCloud } from 'lucide-react';
import { ProductDetailsCard } from '@/components/vendor/products/new/product-details-card';
import { MediaAndCustomizationCard } from '@/components/vendor/products/new/media-and-customization-card';
import { PackageAndShippingCard } from '@/components/vendor/products/new/package-and-shipping-card';
import { OrganizeCard } from '@/components/vendor/products/new/organize-card';
import { AllowedCustomizationsCard } from '@/components/vendor/products/new/allowed-customizations-card';
import type { CustomizationSide, AllowedCustomizationType, CustomizationArea, ProductVariant } from '@/lib/products';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { B2BPricingCard } from '@/components/vendor/corporate/b2b-pricing-card';
import { ProductVariantsCard } from '@/components/vendor/products/new/product-variants-card';

const createDefaultProduct = (): Partial<Product> => ({
  name: '',
  description: '',
  price: '0.00',
  stock: 0,
  vendorId: 'vendor001',
  vendor: 'Gourmet Delights',
  status: 'Draft',
  platform: 'Corporate',
  customizable: false,
  variants: [
    {
        id: 'variant_default',
        colorName: 'Default',
        colorHex: '#ffffff',
        image: null,
        customizationSides: {
            front: { image: null }, back: { image: null }, left: { image: null }, right: { image: null }, top: { image: null }, bottom: { image: null }
        }
    }
  ],
  customizationAreas: {
    front: [], back: [], left: [], right: [], top: [], bottom: []
  },
  galleryImages: [],
  videoUrl: '',
  packaging: { weight: 0, dimensions: { l: 0, w: 0, h: 0 } },
  inventoryBuffer: 0,
  category: '',
  tags: [],
  allowedCustomizations: [],
  preparationTime: { min: 3, max: 4 },
  preparationTimeUnit: 'days',
  moq: 1,
  tieredPricing: []
});

function ProductEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const { toast } = useToast();

    const [product, setProduct] = React.useState<Partial<Product>>(createDefaultProduct());
    const [imageFiles, setImageFiles] = React.useState<Record<string, Record<CustomizationSide, File | null>>>({});
    const [galleryImageFiles, setGalleryImageFiles] = React.useState<File[]>([]);
    const [loading, setLoading] = React.useState(!!productId);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [mainVariantId, setMainVariantId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (productId) {
            getProductById(String(productId)).then((data) => {
                if (data) {
                    const initialProduct = { ...createDefaultProduct(), ...data };
                    setProduct(initialProduct);
                    setMainVariantId(initialProduct.mainVariantId || initialProduct.variants?.[0]?.id || null);
                }
                setLoading(false);
            });
        } else {
            setMainVariantId(createDefaultProduct().variants?.[0]?.id || null);
        }
    }, [productId]);
    
    const handleFieldChange = (field: keyof Product, value: any) => {
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (variantId: string, side: CustomizationSide, file: File | null) => {
        setImageFiles(prev => ({
            ...prev,
            [variantId]: {
                ...(prev[variantId] || {}),
                [side]: file
            }
        }));
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProduct(prev => {
                const newVariants = prev.variants?.map(v => {
                    if (v.id === variantId) {
                        const newSides = { ...v.customizationSides, [side]: { image: imageUrl } };
                        return { ...v, customizationSides: newSides, image: side === 'front' ? imageUrl : v.image };
                    }
                    return v;
                }) || [];
                return { ...prev, variants: newVariants };
            });
        }
    };

    const handleAllowedCustomizationChange = (types: AllowedCustomizationType[]) => {
        setProduct(prev => ({ ...prev, allowedCustomizations: types }));
    }

    const validateProduct = (): boolean => {
        if (product.preparationTime && product.preparationTime.max <= product.preparationTime.min) {
             setError('The preparation time range is invalid. Max days must be greater than min days.');
             window.scrollTo(0, 0);
             return false;
        }
        setError(null);
        return true;
    };

    const handleSave = async (publish: boolean = false) => {
        if (!validateProduct()) return;
        
        setIsSaving(true);
        const finalStatus = publish ? 'Pending Review' : 'Draft';
        const productToSave = { ...product, status: finalStatus, mainVariantId } as Product;
        
        try {
            await saveProduct(productToSave, imageFiles, galleryImageFiles);
            toast({ title: `Product ${publish ? 'Published' : 'Saved'}`, description: `Your product is now ${finalStatus}.` });
            router.push('/vendor/corporate/products');
        } catch (error) {
            console.error("Failed to save product:", error);
            toast({ title: "Error", description: "Could not save the product.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-96 w-full" /></div>
                <div className="lg:col-span-1 space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex items-center justify-between mb-6 gap-4">
                 <div>
                    <h1 className="text-2xl font-bold">{productId ? 'Edit B2B Product' : 'Create New B2B Product'}</h1>
                    <p className="text-muted-foreground">{productId ? 'Update B2B details.' : 'Fill out the form to add a new B2B product.'}</p>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}><Save className="mr-2" />{isSaving ? 'Saving...' : 'Save Draft'}</Button>
                    <Button onClick={() => handleSave(true)} disabled={isSaving}><UploadCloud className="mr-2" />{isSaving ? 'Publishing...' : 'Submit for Review'}</Button>
                 </div>
            </div>
            
            {error && <Alert variant="destructive" className="mb-6"><AlertTitle>Validation Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <ProductDetailsCard name={product.name || ''} description={product.description || ''} onFieldChange={handleFieldChange} />
                    <B2BPricingCard product={product as Product} onFieldChange={handleFieldChange} />
                     <ProductVariantsCard 
                        variants={product.variants || []}
                        onFieldChange={handleFieldChange}
                        mainVariantId={mainVariantId}
                        onMainVariantChange={setMainVariantId}
                     />
                    <MediaAndCustomizationCard 
                        product={product as Product} 
                        onFieldChange={handleFieldChange} 
                        onImageChange={handleImageChange} 
                        galleryImageFiles={galleryImageFiles} 
                        onGalleryFilesChange={setGalleryImageFiles}
                        mainVariantId={mainVariantId}
                    />
                </div>
                <div className="lg:col-span-1 space-y-6 lg:sticky top-20">
                     <PackageAndShippingCard 
                        packaging={product.packaging || { weight: 0, dimensions: { l: 0, w: 0, h: 0 }}}
                        preparationTime={product.preparationTime || { min: 3, max: 4 }} 
                        preparationTimeUnit={product.preparationTimeUnit || 'days'}
                        onFieldChange={handleFieldChange} 
                     />
                     <OrganizeCard product={product as Product} onFieldChange={handleFieldChange} />
                     {product.customizable && <AllowedCustomizationsCard allowedTypes={product.allowedCustomizations || []} onAllowedCustomizationChange={handleAllowedCustomizationChange} />}
                </div>
            </div>
        </div>
    );
}

export default function NewB2BProductPage() {
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <ProductEditorContent />
        </React.Suspense>
    );
}
