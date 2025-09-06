
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '../ui/input';

const MOCK_ADDRESSES = [
    { id: 'addr1', name: 'Home', line1: '123 Maple St', city: 'Springfield', state: 'IL', zip: '62704', country: 'USA' },
    { id: 'addr2', name: 'Work', line1: '456 Oak Ave', city: 'Metropolis', state: 'IL', zip: '62960', country: 'USA' },
];

export function ShippingAddress() {
    const [addresses, setAddresses] = React.useState(MOCK_ADDRESSES);
    const [selectedAddress, setSelectedAddress] = React.useState(addresses[0]?.id || '');
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

    return (
        <>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Shipping Address</CardTitle>
                    <CardDescription>Where should we send your order?</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Add Address
                </Button>
            </CardHeader>
            <CardContent>
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    <div className="space-y-4">
                        {addresses.map(addr => (
                            <Label key={addr.id} htmlFor={addr.id} className="flex items-start gap-4 p-4 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary cursor-pointer">
                                <RadioGroupItem value={addr.id} id={addr.id} />
                                <div className="flex-grow">
                                    <p className="font-semibold">{addr.name}</p>
                                    <p className="text-muted-foreground">{addr.line1}, {addr.city}, {addr.state} {addr.zip}</p>
                                </div>
                            </Label>
                        ))}
                    </div>
                </RadioGroup>
            </CardContent>
            </Card>

             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Shipping Address</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 grid gap-4">
                        <Input placeholder="Full Name" />
                        <Input placeholder="Address Line 1" />
                        <Input placeholder="Address Line 2 (Optional)" />
                         <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="City" />
                            <Input placeholder="State" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="ZIP / Postal Code" />
                            <Input placeholder="Country" />
                         </div>
                        <Input placeholder="Phone Number (e.g. +91 98765 43210)" />
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                         <Button onClick={() => setIsAddDialogOpen(false)}>Save Address</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
