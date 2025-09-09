
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutFailurePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <XCircle className="h-20 w-20 text-destructive mb-6" />
            <h1 className="text-3xl font-bold font-headline mb-2">Payment Failed</h1>
            <p className="text-lg text-muted-foreground mb-4">
                Unfortunately, we were unable to process your payment.
            </p>
            <p className="text-muted-foreground max-w-md">
                Please check your payment details and try again. If the issue persists, please contact your bank or try a different payment method.
            </p>
            <div className="flex gap-4 mt-8">
                <Button asChild>
                    <Link href="/checkout">Try Again</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        </div>
    );
}
