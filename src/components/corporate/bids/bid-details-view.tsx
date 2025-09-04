
'use client';

import * as React from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Bid, VendorBid } from '@/lib/bids-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Award, FileText, Download } from 'lucide-react';
import { calculateDisplayPriceFromQuote, type DisplayPrice } from '@/lib/pricing-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BidDetailsViewProps {
    bidId: string;
}

interface VendorResponseWithPrice extends VendorBid {
    displayPrice?: DisplayPrice;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    const date = dateString?.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BidDetailsView({ bidId }: BidDetailsViewProps) {
    const [bid, setBid] = React.useState<Bid | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [vendorResponses, setVendorResponses] = React.useState<VendorResponseWithPrice[]>([]);
    
    React.useEffect(() => {
        if (!bidId) return;

        const unsub = onSnapshot(doc(db, 'corporateBids', bidId), async (doc) => {
            if (doc.exists()) {
                const bidData = { id: doc.id, ...doc.data() } as Bid;
                setBid(bidData);

                if (bidData.vendorResponses && bidData.products.length > 0) {
                    const productInfo = { id: bidData.products[0].id, category: bidData.products[0].category };
                    const responsesWithPrices = await Promise.all(
                        bidData.vendorResponses.map(async (response) => {
                            const displayPrice = await calculateDisplayPriceFromQuote(response.pricePerUnit, productInfo);
                            return { ...response, displayPrice };
                        })
                    );
                     // Sort by lowest final price first
                    responsesWithPrices.sort((a, b) => (a.displayPrice?.finalPrice ?? Infinity) - (b.displayPrice?.finalPrice ?? Infinity));
                    setVendorResponses(responsesWithPrices);
                }
            } else {
                setBid(null);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [bidId]);

    const getStatusInfo = (status: Bid['status']): { variant: 'default' | 'secondary' | 'destructive', text: string } => {
        switch (status) {
            case 'Active': return { variant: 'default', text: 'Actively accepting bids from vendors.' };
            case 'Awarded': return { variant: 'secondary', text: 'A vendor has been selected for this bid.' };
            case 'Expired': return { variant: 'destructive', text: 'This bid has expired and is no longer active.' };
            default: return { variant: 'secondary', text: 'The status of this bid is unknown.' };
        }
    }


    if (loading) {
        return <Skeleton className="h-[600px] w-full" />;
    }

    if (!bid) {
        return <p>Bid not found.</p>;
    }
    
    const statusInfo = getStatusInfo(bid.status);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Bid Request: {bid.products.map(p => p.name).join(', ')}</h1>
                    <p className="text-muted-foreground">Bid ID: <span className="font-mono text-xs">{bid.id}</span></p>
                </div>
                 <Badge variant={statusInfo.variant} className="w-fit h-fit">{bid.status}</Badge>
            </div>

             <Alert>
                <AlertDescription>
                    {statusInfo.text}
                </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Your Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                         <div className="space-y-1">
                            <h4 className="font-medium">Requested Products</h4>
                            <ul className="pl-4 list-disc text-muted-foreground">
                                {bid.products.map(p => <li key={p.id}>{p.name}</li>)}
                            </ul>
                         </div>
                        <p><strong>Quantity per Item:</strong> {bid.quantity}</p>
                        <p><strong>Delivery Pincode:</strong> {bid.pincode}</p>
                        <p><strong>Timeline:</strong> {bid.deliveryTimeline}</p>
                        <p><strong>Bidding Expires:</strong> {formatDate(bid.dateExpires)}</p>
                        {bid.notes && <p><strong>Notes:</strong> {bid.notes}</p>}
                        {bid.briefUrls && bid.briefUrls.length > 0 && (
                            <div className="space-y-1 pt-2">
                                <h4 className="font-medium">Attachments</h4>
                                {bid.briefUrls.map((url, i) => (
                                     <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                        <Download className="h-4 w-4" />
                                        <span>Attachment {i + 1}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Vendor Responses ({vendorResponses.length})</CardTitle>
                        <CardDescription>Review the quotes submitted by vendors. Prices shown include platform fees.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Your Price / Unit</TableHead>
                                    <TableHead>Est. Delivery</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendorResponses.length > 0 ? vendorResponses.map((res) => (
                                    <TableRow key={res.vendorId}>
                                        <TableCell className="font-medium">{res.vendorName}</TableCell>
                                        <TableCell>
                                             {res.displayPrice ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{formatCurrency(res.displayPrice.finalPrice)}</span>
                                                    {res.displayPrice.hasDiscount && (
                                                        <span className="text-xs text-muted-foreground line-through">{formatCurrency(res.displayPrice.originalPrice)}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <Skeleton className="h-5 w-16" />
                                            )}
                                        </TableCell>
                                        <TableCell>{res.estimatedDeliveryDays} days</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" disabled={bid.status !== 'Active'}>
                                                <Award className="mr-2 h-4 w-4" />
                                                Award Bid
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No responses from vendors yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
