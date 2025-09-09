

'use client';

import * as React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductPageContent } from '@/components/product/product-page-content';


export default function ProductPage({ params: { id } }: { params: { id: string } }) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow">
                 <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
                    <ProductPageContent id={id} />
                </React.Suspense>
            </main>
            <Footer />
        </div>
    );
}
