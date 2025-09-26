
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Hourglass } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function CheckoutPendingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <Hourglass className="h-20 w-20 text-yellow-500 mb-6 animate-pulse" />
                    <h1 className="text-3xl font-bold font-headline mb-2">Payment Pending</h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        Your transaction is currently being processed.
                    </p>
                    <p className="text-muted-foreground max-w-md">
                        We are waiting for confirmation from the payment provider. Please do not close this page. You will be redirected once the status is updated. You can check the status of your order in your account dashboard.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <Button asChild>
                            <Link href="/account?tab=orders">Check Order Status</Link>
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
