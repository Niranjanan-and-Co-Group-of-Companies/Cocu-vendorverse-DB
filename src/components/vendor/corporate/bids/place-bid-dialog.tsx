
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bid, VendorBid } from '@/lib/bids-service';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Info, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PlaceBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bid: Bid | null;
  onBidPlaced: (bidId: string, vendorBid: Omit<VendorBid, 'vendorId' | 'vendorName' | 'timestamp'>) => void;
  vendorId: string;
}

export function PlaceBidDialog({ open, onOpenChange, bid, onBidPlaced, vendorId }: PlaceBidDialogProps) {
  const [pricePerUnit, setPricePerUnit] = React.useState('');
  const [deliveryDays, setDeliveryDays] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (bid) {
        const existingBid = bid.vendorResponses.find(vr => vr.vendorId === vendorId);
        if (existingBid) {
            setPricePerUnit(String(existingBid.pricePerUnit));
            setDeliveryDays(String(existingBid.estimatedDeliveryDays));
            setNotes(existingBid.notes || '');
        } else {
            setPricePerUnit('');
            setDeliveryDays('');
            setNotes('');
        }
    }
  }, [bid, vendorId]);
  
  if (!bid) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onBidPlaced(bid.id, {
        pricePerUnit: parseFloat(pricePerUnit),
        estimatedDeliveryDays: parseInt(deliveryDays, 10),
        notes,
    });
    // The parent component will handle closing the dialog and showing toast
    // The isSubmitting state will be reset when dialog re-opens/unmounts
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  const otherBids = bid.vendorResponses.filter(vr => vr.vendorId !== vendorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
             Submit your best offer for Bid ID: <span className="font-mono">{bid.id.slice(0,8)}...</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-[1fr_2fr]">
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Your Offer</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Your Price per Unit</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                <Input id="price" type="number" step="0.01" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} required className="pl-7"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery">Estimated Delivery (in days)</Label>
                            <Input id="delivery" type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes to Customer (Optional)</Label>
                            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="e.g., Includes premium packaging."/>
                        </div>
                    </CardContent>
                </Card>
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Always the lowest bid is not the winning bit but price is a very important parameter for bidding.
                    </AlertDescription>
                </Alert>
                <DialogFooter className="mt-auto">
                    <Button type="submit" className="w-full" disabled={isSubmitting || !pricePerUnit || !deliveryDays}>
                        {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                        Submit Bid
                    </Button>
                </DialogFooter>
            </form>
            
            {/* Right Column: Bid Details & Competitors */}
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Requested Products</CardTitle></CardHeader>
                    <CardContent>
                        <p className="mb-2">Total Quantity Requested: <strong className="text-primary">{bid.quantity} units</strong></p>
                        <ScrollArea className="h-24 pr-4">
                            <ul className="space-y-3">
                            {bid.products.map(p => (
                                <li key={p.id} className="flex items-center gap-3">
                                    <Image src={p.image} alt={p.name} width={40} height={40} className="rounded-md object-cover" />
                                    <div>
                                        <p className="font-medium">{p.name}</p>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Anonymous Competitor Bids ({otherBids.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-48">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Price/Unit</TableHead>
                                    <TableHead>Delivery</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {otherBids.length > 0 ? otherBids.map((vr, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{formatCurrency(vr.pricePerUnit)}</TableCell>
                                        <TableCell>{vr.estimatedDeliveryDays} days</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                                            You're the first to bid!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
