

'use client';

import * as React from 'react';
import { onProductUpdate } from '@/lib/products-client-service';
import type { Product, ProductVariant } from '@/lib/products';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ProductMediaGallery } from '@/components/product/product-media-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductInteractions } from '@/components/product/product-interactions';
import { ProductDetailsAccordion } from '@/components/product/product-details-accordion';
import { RelatedProductsCarousel } from '@/components/product/related-products-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailableOffers } from '@/components/product/available-offers';
import { use } from 'react';
import { getCategoryByName } from '@/lib/categories-service';
import type { Category } from '@/lib/categories-service';
import { Button } from '@/components/ui/button';

function ProductPageContent({ params }: { params: { id: string } }) {
    const { id } = params;
    const [product, setProduct] = React.useState<Product | null>(null);
    const [category, setCategory] = React.useState<Category | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);

    React.useEffect(() => {
        if (id) {
            setLoading(true);
            const unsubscribe = onProductUpdate(id, async (productData) => {
                setProduct(productData);
                if (productData) {
                    setSelectedVariant(productData.variants?.[0] || null);
                    if (productData.category) {
                        const categoryData = await getCategoryByName(productData.category);
                        setCategory(categoryData);
                    }
                }
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="container py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <Skeleton className="w-full aspect-square" />
                    <div className="mt-4 grid grid-cols-5 gap-4">
                        <Skeleton className="w-full aspect-square" />
                        <Skeleton className="w-full aspect-square" />
                        <Skeleton className="w-full aspect-square" />
                        <Skeleton className="w-full aspect-square" />
                    </div>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container text-center py-20">
                <h1 className="text-2xl font-bold">Product not found</h1>
                <p className="text-muted-foreground mt-2">The product you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
    }

    return (
        <div className="container py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                <ProductMediaGallery
                    name={product.name}
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    galleryImages={product.galleryImages}
                    videoUrl={product.videoUrl}
                />
                <div className="flex flex-col gap-6">
                    <ProductInfo product={product} />
                    
                    {product.variants && product.variants.length > 1 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Color: <span className="text-muted-foreground">{selectedVariant?.colorName}</span></h3>
                            <div className="flex gap-2">
                                {product.variants.map(variant => (
                                    <Button
                                        key={variant.id}
                                        variant="outline"
                                        size="icon"
                                        className={`h-10 w-10 rounded-full ${selectedVariant?.id === variant.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                        style={{ backgroundColor: variant.colorHex }}
                                        onClick={() => handleVariantSelect(variant)}
                                        aria-label={`Select color ${variant.colorName}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <AvailableOffers categoryId={category?.id} productId={product.id} />
                    <ProductInteractions product={product} categoryName={product.category} />
                </div>
            </div>
            <div className="mt-12 lg:mt-20">
                <ProductDetailsAccordion
                    description={product.description || ''}
                    creatorStory={product.creatorStory || ''}
                    categoryName={product.category}
                    platform='personal'
                />
            </div>
            <div className="mt-12 lg:mt-20">
                <RelatedProductsCarousel
                    type="category"
                    value={product.category}
                    currentProductId={product.id}
                    title="Similar Products"
                />
            </div>
             <div className="mt-12 lg:mt-20">
                <RelatedProductsCarousel
                    type="vendor"
                    value={product.vendorId}
                    currentProductId={product.id}
                    title={`More from ${product.vendor}`}
                />
            </div>
        </div>
    );
}


export default function ProductPage({ params }: { params: { id: string } }) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow">
                 <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
                    <ProductPageContent params={use(params)} />
                </React.Suspense>
            </main>
            <Footer />
        </div>
    );
}
