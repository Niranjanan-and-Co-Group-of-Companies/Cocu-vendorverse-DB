
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
import { PricingAndInventoryCard } from '@/components/vendor/products/new/pricing-and-inventory-card';
import { PackageAndShippingCard } from '@/components/vendor/products/new/package-and-shipping-card';
import { OrganizeCard } from '@/components/vendor/products/new/organize-card';
import { AllowedCustomizationsCard } from '@/components/vendor/products/new/allowed-customizations-card';
import type { CustomizationSide, AllowedCustomizationType, CustomizationArea } from '@/lib/products';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const createDefaultProduct = (): Partial<Product> => ({
  name: '',
  description: '',
  price: '0.00',
  stock: 0,
  vendorId: 'vendor001', // This would come from auth context
  vendor: 'Gourmet Delights', // This would come from auth context
  status: 'Draft',
  customizable: false,
  customizationSides: {
    front: { image: null, areas: [] },
    back: { image: null, areas: [] },
    left: { image: null, areas: [] },
    right: { image: null, areas: [] },
    top: { image: null, areas: [] },
    bottom: { image: null, areas: [] },
  },
  galleryImages: [],
  videoUrl: '',
  weight: 0,
  dimensions: { l: 0, w: 0, h: 0 },
  inventoryBuffer: 0,
  category: '',
  tags: [],
  allowedCustomizations: [],
});

function ProductEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const { toast } = useToast();

    const [product, setProduct] = React.useState<Partial<Product>>(createDefaultProduct());
    const [imageFiles, setImageFiles] = React.useState<Record<CustomizationSide, File | null>>({
        front: null, back: null, left: null, right: null, top: null, bottom: null
    });
    const [loading, setLoading] = React.useState(!!productId);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (productId) {
            getProductById(String(productId)).then((data) => {
                if (data) {
                    setProduct({ ...createDefaultProduct(), ...data });
                }
                setLoading(false);
            });
        }
    }, [productId]);
    
    const handleFieldChange = (field: keyof Product, value: any) => {
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (side: CustomizationSide, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [side]: file }));
        setProduct(prev => ({
            ...prev,
            customizationSides: {
                ...prev.customizationSides!,
                [side]: {
                    ...prev.customizationSides![side],
                    image: file ? URL.createObjectURL(file) : null
                }
            }
        }));
    };

    const handleCustomizationAreaChange = (side: CustomizationSide, areas: CustomizationArea[]) => {
        setProduct(prev => ({
            ...prev,
            customizationSides: {
                ...prev.customizationSides!,
                [side]: {
                    ...prev.customizationSides![side],
                    areas: areas
                }
            }
        }));
    };

    const handleAllowedCustomizationChange = (types: AllowedCustomizationType[]) => {
        setProduct(prev => ({ ...prev, allowedCustomizations: types }));
    }

    const validateProduct = (): boolean => {
        if (product.customizable) {
            const uploadedImageCount = Object.values(product.customizationSides || {}).filter(side => side.image).length;
            const hasVideo = !!product.videoUrl;
            if (uploadedImageCount + (hasVideo ? 1 : 0) < 2) {
                setError('A minimum of 2 images (or 1 image and 1 video) is required for customizable products.');
                window.scrollTo(0, 0);
                return false;
            }
        }
        setError(null);
        return true;
    };

    const handleSave = async (publish: boolean = false) => {
        if (!validateProduct()) return;
        
        setIsSaving(true);
        const finalStatus = publish ? 'Pending Review' : 'Draft';
        const productToSave = { ...product, status: finalStatus } as Product;
        
        try {
            await saveProduct(productToSave, imageFiles);
            toast({ 
                title: `Product ${publish ? 'Published' : 'Saved'}`, 
                description: `Your product is now ${finalStatus}.` 
            });
            router.push('/vendor/personalized/products');
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
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex items-center justify-between mb-6 gap-4">
                 <div>
                    <h1 className="text-2xl font-bold">{productId ? 'Edit Product' : 'Create New Product'}</h1>
                    <p className="text-muted-foreground">
                        {productId ? 'Update the details for your product.' : 'Fill out the form to add a new product to your catalog.'}
                    </p>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
                        <Save className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                     <Button onClick={() => handleSave(true)} disabled={isSaving}>
                        <UploadCloud className="mr-2" />
                        {isSaving ? 'Publishing...' : 'Publish Product'}
                    </Button>
                 </div>
            </div>
            
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <ProductDetailsCard
                        name={product.name || ''}
                        description={product.description || ''}
                        onFieldChange={handleFieldChange}
                    />
                    <MediaAndCustomizationCard 
                        product={product as Product}
                        onFieldChange={handleFieldChange}
                        onImageChange={handleImageChange}
                        onCustomizationAreaChange={handleCustomizationAreaChange}
                    />
                </div>
                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6 lg:sticky top-20">
                    <PricingAndInventoryCard 
                        price={product.price || ''}
                        stock={product.stock || 0}
                        onFieldChange={handleFieldChange}
                    />
                     <PackageAndShippingCard
                        weight={product.weight || 0}
                        dimensions={product.dimensions || { l: 0, w: 0, h: 0 }}
                        inventoryBuffer={product.inventoryBuffer || 0}
                        onFieldChange={handleFieldChange}
                    />
                     <OrganizeCard 
                        product={product as Product}
                        onFieldChange={handleFieldChange}
                     />
                     {product.customizable && (
                        <AllowedCustomizationsCard 
                            allowedTypes={product.allowedCustomizations || []}
                            onAllowedCustomizationChange={handleAllowedCustomizationChange}
                        />
                     )}
                </div>
            </div>
        </div>
    );
}


export default function NewProductPage() {
    // This wrapper is needed for Suspense to work with useSearchParams
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <ProductEditorContent />
        </React.Suspense>
    );
}

    