
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Landmark, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PaymentOptions() {
  const [paymentMethod, setPaymentMethod] = React.useState('card');
  return (
    <Card>
        <CardHeader>
            <CardTitle>Payment & Billing</CardTitle>
            <CardDescription>All transactions are secure and encrypted.</CardDescription>
        </CardHeader>
        <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-4">
                    <Label htmlFor="card" className="flex items-start gap-4 p-4 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <div className="flex-grow">
                            <div className="flex items-center gap-2 font-semibold"><CreditCard /> Credit/Debit Card</div>
                            <p className="text-sm text-muted-foreground mt-2">Pay securely with your card.</p>
                            <div className="mt-4 grid gap-4 data-[state=unchecked]:hidden">
                                <Input placeholder="Card Number" />
                                <div className="grid grid-cols-3 gap-4">
                                    <Input placeholder="MM/YY" />
                                    <Input placeholder="CVC" />
                                </div>
                            </div>
                        </div>
                    </Label>
                    <Label htmlFor="po" className="flex items-start gap-4 p-4 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary cursor-pointer">
                        <RadioGroupItem value="po" id="po" />
                        <div className="flex-grow">
                             <div className="flex items-center gap-2 font-semibold"><FileText /> Request Purchase Order</div>
                            <p className="text-sm text-muted-foreground mt-2">Generate a PO and complete payment via bank transfer.</p>
                             <div className="mt-4 data-[state=unchecked]:hidden">
                                 <Button>Generate PO & Place Order</Button>
                            </div>
                        </div>
                    </Label>
                </div>
            </RadioGroup>
        </CardContent>
    </Card>
  );
}
