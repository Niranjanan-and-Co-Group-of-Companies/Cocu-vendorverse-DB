
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductPageContent } from '@/components/product/product-page-content';

// This is now a Server Component. It can access params directly.
export default function CorporateProductPage({ params }: { params: { id: string } }) {
    // It passes the id to the client component, which will handle all state and effects.
    return (
        <main className="flex-grow">
            <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
                 <ProductPageContent id={params.id} />
            </React.Suspense>
        </main>
    );
}
