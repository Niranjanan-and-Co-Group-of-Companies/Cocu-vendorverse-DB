
'use client';

import * as React from 'react';
import { onFeaturedProductsUpdate, type FeaturedProduct } from '@/lib/featured-service';
import { FeaturedProductList } from '@/components/admin/featured/featured-product-list';
import { AddFeaturedProduct } from '@/components/admin/featured/add-featured-product';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedPage() {
    const [allFeaturedProducts, setAllFeaturedProducts] = React.useState<FeaturedProduct[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onFeaturedProductsUpdate((products) => {
            setAllFeaturedProducts(products);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Featured Products</h1>
                    <p className="text-muted-foreground">
                        Curate which products are featured on the Personal and Corporate platforms.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    {loading ? (
                         <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-0">
                                <div className="divide-y">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-16 w-16 rounded-md" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-48" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <Skeleton className="h-5 w-24" />
                                                <Skeleton className="h-5 w-24" />
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <FeaturedProductList products={allFeaturedProducts} />
                    )}
                </div>
                <div className="lg:sticky top-20">
                    <AddFeaturedProduct featuredProductIds={allFeaturedProducts.map(p => p.id)} />
                </div>
            </div>
        </div>
    );
}
