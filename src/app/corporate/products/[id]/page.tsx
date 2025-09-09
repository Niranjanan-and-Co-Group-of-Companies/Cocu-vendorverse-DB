
import * as React from 'react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductPageContent } from '@/components/product/product-page-content';

// This is a Server Component. It can access params directly.
export default function CorporateProductPage({ params }: { params: { id: string } }) {
    // It passes the id as a prop to the client component, which handles state and effects.
    return (
        <main className="flex-grow">
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
                 <ProductPageContent id={params.id} />
            </Suspense>
        </main>
    );
}
