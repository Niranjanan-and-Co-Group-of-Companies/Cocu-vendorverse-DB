
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Bid } from '@/lib/bids-service';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Flag, Trash2 } from 'lucide-react';

interface BidDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bid: Bid | null;
}

export function BidDetailsDialog({ open, onOpenChange, bid }: BidDetailsDialogProps) {
  
  if (!bid) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bid Details</DialogTitle>
          <DialogDescription>
             Bid ID: <span className="font-mono">{bid.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Bid Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Customer ID:</strong> {bid.customerId}</p>
                        <p><strong>Date Created:</strong> {formatDate(bid.dateCreated)}</p>
                        <p><strong>Expires On:</strong> {formatDate(bid.dateExpires)}</p>
                        <p><strong>Quantity Requested:</strong> {bid.quantity} units</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Requested Products</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                        {bid.products.map(p => (
                            <li key={p.id} className="flex items-center gap-3">
                                <Image src={p.image} alt={p.name} width={40} height={40} className="rounded-md object-cover" />
                                <div>
                                    <p className="font-medium">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">Vendor: {p.vendor}</p>
                                </div>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Moderation</CardTitle></CardHeader>
                    <CardContent className="flex gap-2">
                        <Button variant="outline"><Flag className="mr-2"/>Flag for Review</Button>
                        <Button variant="destructive"><Trash2 className="mr-2"/>Delete Bid</Button>
                    </CardContent>
                </Card>
            </div>
            
            {/* Right Column */}
            <div>
                 <Card>
                    <CardHeader><CardTitle>Vendor Responses ({bid.vendorResponses.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Price/Unit</TableHead>
                                    <TableHead>Delivery</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bid.vendorResponses.length > 0 ? bid.vendorResponses.map(vr => (
                                    <TableRow key={vr.vendorId}>
                                        <TableCell className="font-medium">{vr.vendorName}</TableCell>
                                        <TableCell>{formatCurrency(vr.pricePerUnit)}</TableCell>
                                        <TableCell>{vr.estimatedDeliveryDays} days</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No responses yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
