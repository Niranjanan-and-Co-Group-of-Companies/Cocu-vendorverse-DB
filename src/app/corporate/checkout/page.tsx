
'use client';

import * as React from 'react';
import { useCorporateCart } from '@/hooks/use-corporate-cart';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CartSummary } from '@/components/corporate/cart/cart-summary';
import { CheckoutItem } from '@/components/corporate/checkout/checkout-item';
import { Separator } from '@/components/ui/separator';
import { ShippingDetailsForm } from '@/components/corporate/checkout/shipping-details-form';
import { PaymentOptions } from '@/components/corporate/checkout/payment-options';

function CorporateCheckoutPageContent() {
    const { items } = useCorporateCart();
    
    if (items.length === 0) {
        return (
             <div className="container py-20 text-center">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
                <p className="mt-2 text-muted-foreground">You must add items to your cart before proceeding to checkout.</p>
                <Button asChild className="mt-6">
                    <Link href="/corporate/products">Browse Products</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">Corporate Checkout</h1>
                <p className="text-muted-foreground">Finalize your bulk order.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
                {/* Left Column */}
                <div className="space-y-6">
                   <Card>
                       <CardHeader>
                           <CardTitle>Items in Your Order</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                           {items.map((item, index) => (
                               <React.Fragment key={item.id}>
                                   <CheckoutItem item={item} />
                                   {index < items.length - 1 && <Separator />}
                               </React.Fragment>
                           ))}
                       </CardContent>
                   </Card>
                   <ShippingDetailsForm />
                   <PaymentOptions />
                </div>

                {/* Right Column */}
                <div className="lg:sticky top-20">
                   <CartSummary items={items} isCheckoutPage={true} />
                </div>
            </div>
        </div>
    )
}


export default function CorporateCheckoutPage() {
  return (
    <main className="flex-grow">
        <CorporateCheckoutPageContent />
    </main>
  );
}
