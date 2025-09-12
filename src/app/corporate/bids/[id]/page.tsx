
'use client';

import * as React from 'react';
import { BidDetailsView } from '@/components/corporate/bids/bid-details-view';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function BidDetailsPageContent({ id }: { id: string }) {
    if (!id) {
        return <Skeleton className="h-[600px] w-full" />;
    }
    return (
        <div className="flex flex-col gap-6">
            <Link href="/corporate/bids" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2" />
                Back to All Bids
            </Link>
            <BidDetailsView bidId={id} />
        </div>
    );
}


export default function BidDetailsPage({ params }: { params: { id: string } }) {
    return (
        <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <BidDetailsPageContent id={params.id} />
        </React.Suspense>
    );
}
