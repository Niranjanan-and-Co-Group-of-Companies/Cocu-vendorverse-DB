

'use client';

import * as React from 'react';
import { onProductUpdate } from '@/lib/products-client-service';
import type { Product } from '@/lib/products';
import { ProductMediaGallery } from '@/components/product/product-media-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductDetailsAccordion } from '@/components/product/product-details-accordion';
import { RelatedProductsCarousel } from '@/components/product/related-products-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { CorporateProductInteractions } from '@/components/corporate/corporate-product-interactions';
import { AvailableOffers } from '@/components/product/available-offers';
import { use } from 'react';
import { getCategoryByName } from '@/lib/categories-service';
import type { Category } from '@/lib/categories-service';

function ProductPageContent({ params }: { params: { id: string } }) {
    const { id } = use(params);
    const [product, setProduct] = React.useState<Product | null>(null);
    const [category, setCategory] = React.useState<Category | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [quantity, setQuantity] = React.useState(1);
    const [totalPrice, setTotalPrice] = React.useState<number | null>(null);
    const [unitPrice, setUnitPrice] = React.useState<string | null>(null);


    React.useEffect(() => {
        if (id) {
            setLoading(true);
            const unsubscribe = onProductUpdate(id, async (productData) => {
                setProduct(productData);
                if (productData) {
                    const categoryData = await getCategoryByName(productData.category);
                    setCategory(categoryData);
                    setQuantity(productData.moq || 1);
                    setUnitPrice(productData.price);
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

    return (
        <div className="container py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                <ProductMediaGallery
                    name={product.name}
                    variants={product.variants}
                    selectedVariant={product.variants?.[0] || null}
                    galleryImages={product.galleryImages}
                    videoUrl={product.videoUrl}
                />
                <div className="flex flex-col gap-6">
                    <ProductInfo
                        product={product}
                        displayPrice={unitPrice}
                        totalPrice={totalPrice}
                        quantity={quantity}
                    />
                    <AvailableOffers categoryId={category?.id} productId={product.id} />
                    <CorporateProductInteractions 
                        product={product} 
                        onPriceChange={({unit, total, quantity}) => {
                            setUnitPrice(unit);
                            setTotalPrice(total);
                            setQuantity(quantity);
                        }}
                    />
                </div>
            </div>
            <div className="mt-12 lg:mt-20">
                <ProductDetailsAccordion
                    description={product.description || ''}
                    creatorStory={product.creatorStory || ''}
                    categoryName={product.category}
                    platform='corporate'
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


export default function CorporateProductPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <main className="flex-grow">
            <ProductPageContent params={params} />
        </main>
    );
}
