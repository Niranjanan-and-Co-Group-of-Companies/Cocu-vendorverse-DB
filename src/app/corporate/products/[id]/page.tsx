
'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductPageContent } from '@/components/product/product-page-content';
import { onProductUpdate } from '@/lib/products-client-service';
import type { Product } from '@/lib/products';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';


function CorporateProductPageContent({ id }: { id: string }) {
    const [product, setProduct] = React.useState<Product | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (id) {
            const unsubscribe = onProductUpdate(id, (productData) => {
                setProduct(productData);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [id]);

    if (loading) {
        return <Skeleton className="h-screen w-full" />;
    }

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
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
    
    return <ProductPageContent product={product} />;
}


export default function CorporateProductPage({ params }: { params: { id: string } }) {
    const { id } = React.use(params);
    return (
        <main className="flex-grow">
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
                 <CorporateProductPageContent id={id} />
            </Suspense>
        </main>
    );
}
