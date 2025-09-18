
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';
import type { PlainVendor } from '@/lib/vendors-service';
import { getVendorById } from '@/lib/vendors-service';

interface VendorReviewCardProps {
  vendorId: string;
}

export function VendorReviewCard({ vendorId }: VendorReviewCardProps) {
  const [vendor, setVendor] = React.useState<PlainVendor | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (vendorId) {
      setLoading(true);
      getVendorById(vendorId).then(vendorData => {
        setVendor(vendorData);
        setLoading(false);
      });
    }
  }, [vendorId]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Submitted By</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-5 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!vendor) {
    return (
      <Card>
        <CardHeader><CardTitle>Submitted By</CardTitle></CardHeader>
        <CardContent>
          <p className="text-destructive">Vendor not found.</p>
        </CardContent>
      </Card>
    );
  }

  const isKycVerified = vendor.kyc?.status === 'Verified';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted By</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={vendor.avatar} />
            <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{vendor.name}</p>
            <p className="text-sm text-muted-foreground">{vendor.email}</p>
          </div>
        </div>
        {isKycVerified && (
          <Badge>
            <ShieldCheck className="mr-2 h-4 w-4" />
            KYC Verified
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
