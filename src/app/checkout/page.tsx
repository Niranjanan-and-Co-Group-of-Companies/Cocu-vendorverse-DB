
'use client';

import * as React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { OrderSummary } from '@/components/checkout/order-summary';
import { ShippingAddress } from '@/components/checkout/shipping-address';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PhoneVerificationDialog } from '@/components/checkout/phone-verification-dialog';
import { getMockUser } from '@/lib/user-service';

function CheckoutPageContent() {
    const { items } = useCart();
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [isVerificationOpen, setIsVerificationOpen] = React.useState(false);

    React.useEffect(() => {
        getMockUser().then(userData => {
            setUser(userData);
            setLoading(false);
            if (userData && !userData.isPhoneVerified) {
                setIsVerificationOpen(true);
            }
        });
    }, []);
    
    if (loading) {
        return (
            <div className="container py-20 text-center">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-muted-foreground" />
                <p className="mt-4 text-lg">Loading your details...</p>
            </div>
        )
    }
    
    if (items.length === 0) {
        return (
             <div className="container py-20 text-center">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
                <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild className="mt-6">
                    <Link href="/">Start Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
                {/* Left Column */}
                <div className="space-y-6">
                   <ShippingAddress />
                   <Card>
                       <CardHeader>
                           <CardTitle>Delivery Method</CardTitle>
                       </CardHeader>
                       <CardContent>
                           <p className="text-muted-foreground">Delivery options will be available after entering an address.</p>
                       </CardContent>
                   </Card>
                   <Card>
                       <CardHeader>
                           <CardTitle>Payment Options</CardTitle>
                           <CardDescription>All transactions are secure and encrypted.</CardDescription>
                       </CardHeader>
                       <CardContent>
                           <div className="text-center text-muted-foreground py-8">
                               <p>Payment integration coming soon.</p>
                           </div>
                       </CardContent>
                   </Card>
                </div>

                {/* Right Column */}
                <div className="sticky top-20">
                   <OrderSummary />
                </div>
            </div>
             <PhoneVerificationDialog
                isOpen={isVerificationOpen}
                onOpenChange={setIsVerificationOpen}
                onVerified={() => {
                    if (user) user.isPhoneVerified = true;
                    setIsVerificationOpen(false);
                }}
            />
        </div>
    )
}


export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-grow">
        <CheckoutPageContent />
      </main>
      <Footer />
    </div>
  );
}
