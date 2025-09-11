
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCorporateAccount } from '@/hooks/use-corporate-account-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function ShippingDetailsForm() {
    const { account, isLoading } = useCorporateAccount();

    const getGstStatusVariant = (status?: 'Verified' | 'Pending' | 'Failed' | 'Not Provided') => {
        switch (status) {
            case 'Verified': return 'default';
            case 'Pending': return 'secondary';
            case 'Failed': return 'destructive';
            default: return 'outline';
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                     <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-20 w-full" /></div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Company & Shipping Details</CardTitle>
                    <CardDescription>Review your company's billing and delivery information.</CardDescription>
                </div>
                <Link href="/corporate/settings" className="text-sm font-medium text-primary hover:underline">Edit</Link>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <p className="font-semibold text-muted-foreground">{account?.name || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>GSTIN</Label>
                         <div className="flex items-center gap-2">
                            <p className="font-semibold text-muted-foreground">{account?.gstProfile?.gstin || 'Not Provided'}</p>
                            {account?.gstProfile?.gstin && (
                                <Badge variant={getGstStatusVariant(account.gstStatus)}>{account.gstStatus}</Badge>
                            )}
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <p className="text-muted-foreground">{account?.contactPerson || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Phone</Label>
                         <p className="text-muted-foreground">{account?.phone || 'N/A'}</p>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Default Shipping Address</Label>
                    <address className="not-italic text-muted-foreground p-3 border rounded-md bg-muted/30">
                        {account?.pickupAddresses?.[0]?.street || 'N/A'}<br />
                        {account?.pickupAddresses?.[0]?.city}, {account?.pickupAddresses?.[0]?.state} - {account?.pickupAddresses?.[0]?.pincode}
                    </address>
                </div>
            </CardContent>
        </Card>
    );
}
