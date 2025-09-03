
'use client';

import * as React from 'react';
import { onProductUpdate } from '@/lib/products-service';
import type { Product } from '@/lib/products';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { CustomizationStudio } from '@/components/personalization/customization-studio';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomizationProvider } from '@/hooks/use-customization';

function CustomizePageContent({ params }: { params: { id: string } }) {
    const [product, setProduct] = React.useState<Product | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (params.id) {
            setLoading(true);
            const unsubscribe = onProductUpdate(String(params.id), (productData) => {
                setProduct(productData);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex-grow container py-8">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_320px] gap-6 h-[calc(100vh-10rem)]">
                    <Skeleton className="h-full w-full" />
                    <Skeleton className="h-full w-full" />
                    <Skeleton className="h-full w-full" />
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
    
    if (!product.customizable) {
        return (
            <div className="container text-center py-20">
                <h1 className="text-2xl font-bold">Product Not Customizable</h1>
                <p className="text-muted-foreground mt-2">This product is not available for personalization.</p>
            </div>
        );
    }

    return (
        <CustomizationProvider>
            <CustomizationStudio product={product} />
        </CustomizationProvider>
    );
}


export default function CustomizePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow">
                <React.Suspense fallback={<p>Loading...</p>}>
                    <CustomizePageContent params={resolvedParams} />
                </React.Suspense>
            </main>
            <Footer />
        </div>
    );
}
