
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
                isSubmitting={isSubmitting}
                itemCount={items.length}
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
