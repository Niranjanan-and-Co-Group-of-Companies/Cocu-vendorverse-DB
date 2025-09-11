
'use client';

import * as React from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Vendor } from '@/lib/vendors-service';
import { Skeleton } from '@/components/ui/skeleton';
import { VendorProfileCard } from '@/components/vendor/settings/vendor-profile-card';
import { PickupAddressCard } from '@/components/vendor/settings/pickup-address-card';
import { BankingDetailsCard } from '@/components/vendor/settings/banking-details-card';
import { KycStatusCard } from '@/components/vendor/settings/kyc-status-card';
import { useToast } from '@/hooks/use-toast';

// In a real app, this would come from an auth context
const VENDOR_ID = 'vendor001';

export default function VendorSettingsPage() {
    const [vendor, setVendor] = React.useState<Vendor | null>(null);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        if (!VENDOR_ID) {
            setLoading(false);
            toast({ title: "Error", description: "Could not find vendor information.", variant: "destructive" });
            return;
        }

        const vendorRef = doc(db, 'vendors', VENDOR_ID);
        const unsubscribe = onSnapshot(vendorRef, (docSnap) => {
            if (docSnap.exists()) {
                setVendor({ id: docSnap.id, ...docSnap.data() } as Vendor);
            } else {
                toast({ title: "Error", description: "Vendor data not found.", variant: "destructive" });
                setVendor(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (!vendor) {
        return <p>No vendor data available.</p>;
    }
    
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <VendorProfileCard vendor={vendor} />
            <PickupAddressCard vendor={vendor} />
            <BankingDetailsCard vendor={vendor} />
        </div>
        <div className="lg:col-span-1">
             <KycStatusCard kyc={vendor.kyc} />
        </div>
      </div>
    </div>
  );
}
