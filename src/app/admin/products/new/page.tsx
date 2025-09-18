

'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductById, saveProduct, type Product } from '@/lib/products-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save, UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { ProductDetailsCard } from '@/components/vendor/products/new/product-details-card';
import { MediaAndCustomizationCard } from '@/components/vendor/products/new/media-and-customization-card';
import { PricingAndInventoryCard } from '@/components/vendor/products/new/pricing-and-inventory-card';
import { PackageAndShippingCard } from '@/components/vendor/products/new/package-and-shipping-card';
import { OrganizeCard } from '@/components/vendor/products/new/organize-card';
import { AllowedCustomizationsCard } from '@/components/vendor/products/new/allowed-customizations-card';
import type { CustomizationSide, AllowedCustomizationType, CustomizationArea, ProductVariant } from '@/lib/products';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getVendors, type PlainVendor } from '@/lib/vendors-service';
import { B2BPricingCard } from '@/components/vendor/corporate/b2b-pricing-card';
import { ProductVariantsCard } from '@/components/vendor/products/new/product-variants-card';
import { VendorReviewCard } from '@/components/admin/products/vendor-review-card';
import { approveProduct, declineProduct } from '@/lib/products-service';

const createDefaultProduct = (): Partial<Product> => ({
  name: '',
  description: '',
  price: '0.00',
  stock: 0,
  vendorId: 'admin',
  vendor: 'VendorVerse',
  status: 'Draft',
  platform: 'Personalized',
  customizable: false,
  hasVariants: false,
  variants: [
    {
        id: 'variant_default',
        colorName: 'Default',
        colorHex: '#ffffff',
        image: null,
        galleryImages: [],
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
  preparationTime: { min: 3, max: 4 }, // Default preparation time
  preparationTimeUnit: 'days',
  moq: 1,
  tieredPricing: [],
});

function NewProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const viewMode = searchParams.get('view');
    const isReviewMode = viewMode === 'review';
    
    const { toast } = useToast();

    const [product, setProduct] = React.useState<Partial<Product>>(createDefaultProduct());
    const [imageFiles, setImageFiles] = React.useState<Record<string, Record<CustomizationSide, File | null>>>({});
    const [galleryImageFilesByVariant, setGalleryImageFilesByVariant] = React.useState<Record<string, File[]>>({});
    const [loading, setLoading] = React.useState(!!productId);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [vendors, setVendors] = React.useState<PlainVendor[]>([]);
    const [mainVariantId, setMainVariantId] = React.useState<string | null>(product.variants?.[0]?.id || null);

    React.useEffect(() => {
        if (product.variants && product.variants.length > 0) {
            setMainVariantId(product.mainVariantId || product.variants[0].id);
        }
    }, [product.variants, product.mainVariantId]);


    React.useEffect(() => {
        getVendors().then(setVendors);
    }, []);

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
        if (isReviewMode) return;
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (variantId: string, side: CustomizationSide, file: File | null) => {
        if (isReviewMode) return;
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
                        const newSides = { ...(v.customizationSides || {}) };
                        newSides[side] = { ...(newSides[side] || {}), image: imageUrl };

                        return { ...v, customizationSides: newSides };
                    }
                    return v;
                }) || [];
                return { ...prev, variants: newVariants };
            });
        }
    };

    const handleGalleryFilesChange = (variantId: string, files: File[]) => {
        if (isReviewMode) return;
        setGalleryImageFilesByVariant(prev => ({
            ...prev,
            [variantId]: files
        }));
    };

    const handleAllowedCustomizationChange = (types: AllowedCustomizationType[]) => {
        if (isReviewMode) return;
        setProduct(prev => ({ ...prev, allowedCustomizations: types }));
    }
    
    const handleApprove = async () => {
        if (!productId) return;
        setIsSaving(true);
        await approveProduct(productId);
        toast({ title: 'Product Approved', description: 'The product is now live on the marketplace.' });
        router.push('/admin/products/new-products');
        setIsSaving(false);
    };

    const handleDecline = async () => {
        if (!productId) return;
        setIsSaving(true);
        await declineProduct(productId);
        toast({ title: 'Product Declined', description: 'The product has been returned to the vendor as a draft.', variant: 'destructive' });
        router.push('/admin/products/new-products');
        setIsSaving(false);
    };


    const validateProduct = (): boolean => {
        if (product.customizable) {
            const hasAtLeastOneImage = product.variants?.some(v => v.image || Object.values(v.customizationSides).some(s => s.image));
             if (!hasAtLeastOneImage) {
                setError('Each variant must have at least one image (main or side) for customizable products.');
                window.scrollTo(0, 0);
                return false;
            }
        }
        if (product.preparationTime && product.preparationTime.max <= product.preparationTime.min) {
             setError('The preparation time range is invalid. Max prep time must be greater than min prep time.');
             window.scrollTo(0, 0);
             return false;
        }

        setError(null);
        return true;
    };

    const handleSave = async (publish: boolean = false) => {
        if (isReviewMode || !validateProduct()) return;
        
        setIsSaving(true);
        const finalStatus = publish ? 'Live' : 'Draft';
        const productToSave = { ...product, status: finalStatus, mainVariantId } as Product;
        
        try {
            await saveProduct(productToSave, imageFiles, galleryImageFilesByVariant);
            toast({ 
                title: `Product ${publish ? 'Published' : 'Saved'}`, 
                description: `Your product is now ${finalStatus}.` 
            });
            router.push('/admin/products');
        } catch (error) {
            console.error("Failed to save product:", error);
            toast({ title: "Error", description: "Could not save the product.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const isCorporate = product.platform === 'Corporate';
    const pageTitle = isReviewMode 
        ? 'Review Product Submission'
        : (productId ? 'Edit Product' : 'Create New Product');
    const pageDescription = isReviewMode
        ? 'Review the details submitted by the vendor before approving or declining.'
        : (productId ? 'Update the details for this product.' : 'Fill out the form to add a new product.');


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
                    <h1 className="text-2xl font-bold">{pageTitle}</h1>
                    <p className="text-muted-foreground">{pageDescription}</p>
                 </div>
                 {isReviewMode ? (
                     <div className="flex gap-2">
                        <Button variant="destructive" onClick={handleDecline} disabled={isSaving}>
                            <XCircle className="mr-2" />
                            Decline
                        </Button>
                        <Button onClick={handleApprove} disabled={isSaving}>
                            <CheckCircle className="mr-2" />
                            Approve Product
                        </Button>
                    </div>
                 ) : (
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
                 )}
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
                        isReviewMode={isReviewMode}
                    />
                    {isCorporate ? (
                        <B2BPricingCard product={product as Product} onFieldChange={handleFieldChange} isReviewMode={isReviewMode} />
                    ) : (
                        <PricingAndInventoryCard 
                            price={product.price || ''}
                            stock={product.stock || 0}
                            maxQuantityPerOrder={product.maxQuantityPerOrder}
                            discountType={product.discountType}
                            discountValue={product.discountValue}
                            onFieldChange={handleFieldChange}
                            isReviewMode={isReviewMode}
                        />
                    )}
                     <ProductVariantsCard 
                        product={product as Product}
                        onFieldChange={handleFieldChange}
                        mainVariantId={mainVariantId}
                        onMainVariantChange={setMainVariantId}
                        isReviewMode={isReviewMode}
                     />
                    <MediaAndCustomizationCard 
                        product={product as Product}
                        onFieldChange={handleFieldChange}
                        onImageChange={handleImageChange}
                        galleryImageFilesByVariant={galleryImageFilesByVariant}
                        onGalleryFilesChange={handleGalleryFilesChange}
                        mainVariantId={mainVariantId}
                        isReviewMode={isReviewMode}
                    />
                </div>
                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6 lg:sticky top-20">
                     {isReviewMode && product.vendorId && <VendorReviewCard vendorId={product.vendorId} />}
                     <OrganizeCard 
                        product={product as Product}
                        onFieldChange={handleFieldChange}
                        isAdmin={true}
                        vendors={vendors}
                        isReviewMode={isReviewMode}
                     />
                     <PackageAndShippingCard
                        packaging={product.packaging || { weight: 0, dimensions: { l: 0, w: 0, h: 0 } }}
                        preparationTime={product.preparationTime || { min: 3, max: 4 }}
                        preparationTimeUnit={product.preparationTimeUnit || 'days'}
                        onFieldChange={handleFieldChange}
                        isReviewMode={isReviewMode}
                    />
                     {product.customizable && (
                        <AllowedCustomizationsCard 
                            allowedTypes={product.allowedCustomizations || []}
                            onAllowedCustomizationChange={handleAllowedCustomizationChange}
                            isReviewMode={isReviewMode}
                        />
                     )}
                </div>
            </div>
        </div>
    );
}


export default function ProductEditorPage() {
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <NewProductPage />
        </React.Suspense>
    );
}


