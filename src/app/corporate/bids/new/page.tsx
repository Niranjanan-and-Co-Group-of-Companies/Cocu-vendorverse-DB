
'use client';

import * as React from 'react';
import { useBidRequest } from '@/hooks/use-bid-request';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { SelectedProductsCard } from '@/components/corporate/bids/new/selected-products-card';
import { BidDetailsCard, type BidDetails } from '@/components/corporate/bids/new/bid-details-card';
import { AdditionalInfoCard, type AdditionalInfo } from '@/components/corporate/bids/new/additional-info-card';
import { SubmitBidCard } from '@/components/corporate/bids/new/submit-bid-card';
import { SubmitBidDialog } from '@/components/corporate/bids/new/submit-bid-dialog';

export default function NewBidPage() {
  const { items, clearBid } = useBidRequest();
  const router = useRouter();
  const [bidDetails, setBidDetails] = React.useState<BidDetails>({
    quantity: 100,
    pincode: '',
    deliveryTimeline: '',
    biddingDuration: '24',
  });
  const [additionalInfo, setAdditionalInfo] = React.useState<AdditionalInfo>({
    notes: '',
    briefFile: null,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Your bid request is empty.</h2>
        <p className="text-muted-foreground mt-2">Add products to a bid from the catalog to get started.</p>
        <Button asChild className="mt-4">
          <Link href="/corporate/products">
            <ArrowLeft className="mr-2" /> Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Create New Bid Request</h1>
                <p className="text-muted-foreground">Finalize the details below and submit to receive quotes from vendors.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <SelectedProductsCard />
            <BidDetailsCard details={bidDetails} onDetailsChange={setBidDetails} />
            <AdditionalInfoCard info={additionalInfo} onInfoChange={setAdditionalInfo} />
          </div>
          <div className="lg:sticky top-20">
            <SubmitBidCard 
                disabled={isSubmitting}
                onSubmit={() => setIsSubmitting(true)}
            />
          </div>
        </div>
      </div>
      
      <SubmitBidDialog
        isOpen={isSubmitting}
        onClose={() => setIsSubmitting(false)}
        bidDetails={bidDetails}
        additionalInfo={additionalInfo}
        products={items}
        onBidFinalized={() => {
            clearBid();
            router.push('/corporate/bids');
        }}
      />
    </>
  );
}
