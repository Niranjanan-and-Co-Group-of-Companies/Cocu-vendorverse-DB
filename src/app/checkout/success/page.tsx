
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function CheckoutSuccessPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
                    <h1 className="text-3xl font-bold font-headline mb-2">Thank You For Your Order!</h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        Your payment was successful and your order is confirmed.
                    </p>
                    <p className="text-muted-foreground max-w-md">
                        You will receive an email confirmation shortly with your order details.
                        You can also view your order history in your account dashboard.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <Button asChild>
                            <Link href="/account?tab=orders">View My Orders</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
