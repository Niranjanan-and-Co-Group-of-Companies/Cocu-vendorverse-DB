
'use client';

import * as React from 'react';
import { onProductUpdate } from '@/lib/products-service';
import type { Product } from '@/lib/products';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ProductMediaGallery } from '@/components/product/product-media-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductInteractions } from '@/components/product/product-interactions';
import { ProductDetailsAccordion } from '@/components/product/product-details-accordion';
import { RelatedProductsCarousel } from '@/components/product/related-products-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailableOffers } from '@/components/product/available-offers';

function ProductPageContent({ params }: { params: { id: string } }) {
    const [product, setProduct] = React.useState<Product | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (params.id) {
            setLoading(true);
            const unsubscribe = onProductUpdate(params.id, (productData) => {
                setProduct(productData);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [params.id]);

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
                    mainImage={product.image}
                    galleryImages={product.galleryImages}
                    videoUrl={product.videoUrl}
                />
                <div className="flex flex-col gap-6">
                    <ProductInfo product={product} />
                    <AvailableOffers categoryName={product.category} productId={product.id} />
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
                    category={product.category}
                    currentProductId={product.id}
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
                <ProductPageContent params={params} />
            </main>
            <Footer />
        </div>
    );
}
