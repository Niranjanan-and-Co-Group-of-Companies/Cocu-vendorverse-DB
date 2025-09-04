

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
import type { Bid, VendorBid } from '@/lib/bids-service';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Flag, Trash2, Loader2 } from 'lucide-react';
import { calculateDisplayPriceFromQuote, type DisplayPrice } from '@/lib/pricing-service';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryByName } from '@/lib/categories-service';

interface BidDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bid: Bid | null;
}

interface VendorResponseWithPrice extends VendorBid {
    displayPrice?: DisplayPrice;
}


export function BidDetailsDialog({ open, onOpenChange, bid }: BidDetailsDialogProps) {
  const [vendorResponses, setVendorResponses] = React.useState<VendorResponseWithPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = React.useState(true);

  React.useEffect(() => {
    if (bid?.vendorResponses && bid.products.length > 0) {
        setLoadingPrices(true);
        const productInfo = { id: bid.products[0].id, category: bid.products[0].category };
        
        getCategoryByName(productInfo.category).then(category => {
            Promise.all(bid.vendorResponses.map(async (response) => {
                const displayPrice = await calculateDisplayPriceFromQuote(response.pricePerUnit, productInfo, category ?? undefined);
                return { ...response, displayPrice };
            })).then(responsesWithPrices => {
                setVendorResponses(responsesWithPrices);
                setLoadingPrices(false);
            });
        });
    } else {
        setVendorResponses([]);
        setLoadingPrices(false);
    }
  }, [bid]);

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
                                    <TableHead>Customer Price/Unit</TableHead>
                                    <TableHead>Delivery</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingPrices ? (
                                    Array.from({length: 3}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : vendorResponses.length > 0 ? vendorResponses.map(vr => (
                                    <TableRow key={vr.vendorId}>
                                        <TableCell className="font-medium">{vr.vendorName}</TableCell>
                                        <TableCell>
                                            {vr.displayPrice ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{formatCurrency(vr.displayPrice.finalPrice)}</span>
                                                    {vr.displayPrice.hasDiscount && (
                                                        <span className="text-xs text-muted-foreground line-through">{formatCurrency(vr.displayPrice.originalPrice)}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                        </TableCell>
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
