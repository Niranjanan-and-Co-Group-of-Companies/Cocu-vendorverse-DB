
'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductPageContent } from '@/components/product/product-page-content';
import { onProductUpdate } from '@/lib/products-client-service';
import type { PlainProduct } from '@/lib/products-service';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { usePathname } from 'next/navigation';
import CorporateHeader from '../layout/corporate-header';

export function ProductPageClient({ id }: { id: string }) {
    const [product, setProduct] = React.useState<PlainProduct | null>(null);
    const [loading, setLoading] = React.useState(true);
    const pathname = usePathname();
    const isCorporate = pathname.includes('/corporate');

    React.useEffect(() => {
        if (!id) return;

        const unsubscribe = onProductUpdate(id, (productData) => {
            setProduct(productData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id]);

    const PageHeader = isCorporate ? CorporateHeader : Header;

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <PageHeader />
                <main className="flex-grow">
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
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
             <div className="flex flex-col min-h-screen">
                <PageHeader />
                <main className="flex-grow">
                    <div className="container text-center py-20">
                        <h1 className="text-2xl font-bold">Product not found</h1>
                        <p className="text-muted-foreground mt-2">The product you are looking for does not exist or has been removed.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader />
            <main className="flex-grow">
                <ProductPageContent product={product} />
            </main>
            <Footer />
        </div>
    );
}
