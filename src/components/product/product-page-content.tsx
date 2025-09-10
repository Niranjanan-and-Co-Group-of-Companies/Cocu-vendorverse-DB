

'use client';

import * as React from 'react';
import type { PlainProduct } from '@/lib/products-service';
import type { Product, ProductVariant } from '@/lib/products';
import { ProductMediaGallery } from '@/components/product/product-media-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductInteractions } from '@/components/product/product-interactions';
import { ProductDetailsAccordion } from '@/components/product/product-details-accordion';
import { RelatedProductsCarousel } from '@/components/product/related-products-carousel';
import { Button } from '@/components/ui/button';

export function ProductPageContent({ product }: { product: PlainProduct }) {
    const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);

    React.useEffect(() => {
        if (product && product.variants) {
            const mainVariant = product.variants.find(v => v.id === product.mainVariantId) || product.variants[0];
            setSelectedVariant(mainVariant || null);
        }
    }, [product]);


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
                    product={product as Product}
                    selectedVariant={selectedVariant}
                />
                <div className="flex flex-col gap-6">
                    <ProductInfo product={product as Product} />
                    
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

                    <ProductInteractions product={product as Product} categoryName={product.category} selectedVariant={selectedVariant} />
                </div>
            </div>
            <div className="mt-12 lg:mt-20">
                <ProductDetailsAccordion
                    description={product.description || ''}
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
                    title="More from the same vendor"
                />
            </div>
        </div>
    );
}
