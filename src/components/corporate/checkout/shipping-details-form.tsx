
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ShippingDetailsForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Company & Shipping Details</CardTitle>
                <CardDescription>Enter the details for billing and delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input id="company-name" placeholder="e.g., Globex Corporation" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN (Optional)</Label>
                        <Input id="gstin" placeholder="29ABCDE1234F1Z5" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contact-person">Contact Person</Label>
                        <Input id="contact-person" placeholder="John Smith" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact-phone">Contact Phone</Label>
                        <Input id="contact-phone" type="tel" placeholder="+91 98765 43210" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="shipping-address">Shipping Address</Label>
                    <Textarea id="shipping-address" placeholder="123 Corporate Ave, Business Bay, Metropolis - 400051" rows={3} />
                </div>
            </CardContent>
        </Card>
    );
}
