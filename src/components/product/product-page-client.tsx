
'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductPageContent } from '@/components/product/product-page-content';
import { onProductUpdate } from '@/lib/products-client-service';
import type { PlainProduct } from '@/lib/products-service';

export function ProductPageClient({ id }: { id: string }) {
    const [product, setProduct] = React.useState<PlainProduct | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!id) return;

        const unsubscribe = onProductUpdate(id, (productData) => {
            setProduct(productData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id]);

    if (loading) {
        return (
            <div className="container py-8 md:py-12">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    <Skeleton className="w-full aspect-square" />
                     <div className="space-y-6">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-12 w-1/2" />
                        <Skeleton className="h-48 w-full" />
                    </div>
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
    
    return <ProductPageContent product={product} />;
}
