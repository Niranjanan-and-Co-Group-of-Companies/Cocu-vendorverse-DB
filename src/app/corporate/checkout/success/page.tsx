
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CorporateCheckoutSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
            <h1 className="text-3xl font-bold font-headline mb-2">Thank You For Your Order!</h1>
            <p className="text-lg text-muted-foreground mb-4">
                Your order has been successfully placed.
            </p>
            <p className="text-muted-foreground max-w-md">
                You will receive an email confirmation shortly with your order details.
                You can also view your order history in your corporate account dashboard.
            </p>
            <div className="flex gap-4 mt-8">
                <Button asChild>
                    <Link href="/corporate/accounts?tab=orders">View Corporate Orders</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/corporate/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}

    