
import * as React from 'react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductPageContent } from '@/components/product/product-page-content';
import { getProductById, serializeProduct } from '@/lib/products-service';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

// This is a Server Component. It can access params directly.
export default async function CorporateProductPage({ params }: { params: { id: string } }) {
    const productData = await getProductById(params.id);

    if (!productData) {
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
    
    // Serialize the product data on the server before passing it to the client component.
    const product = await serializeProduct(productData);
    
    return (
        <main className="flex-grow">
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
                 <ProductPageContent product={product} />
            </Suspense>
        </main>
    );
}
