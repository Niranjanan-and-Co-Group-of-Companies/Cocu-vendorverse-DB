
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { onBidsUpdate, type Bid, placeOrUpdateBid, type VendorBid } from '@/lib/bids-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceBidDialog } from '@/components/vendor/corporate/bids/place-bid-dialog';
import { useToast } from '@/hooks/use-toast';
import { differenceInHours, formatDistanceToNowStrict } from 'date-fns';

const VENDOR_ID = 'vendor001';
const VENDOR_NAME = 'Gourmet Delights';

const ProductAvatars = ({ products }: { products: Bid['products'] }) => (
    <div className="flex -space-x-2 overflow-hidden">
        {products.slice(0, 3).map((p, i) => (
            <Avatar key={p.id || i} className="h-8 w-8 border-2 border-card">
                <AvatarImage src={p.image} alt={p.name} />
                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
            </Avatar>
        ))}
        {products.length > 3 && (
            <Avatar className="h-8 w-8 border-2 border-card">
                <AvatarFallback>+{products.length - 3}</AvatarFallback>
            </Avatar>
        )}
    </div>
);

const TimeLeft = ({ expiry }: { expiry: string }) => {
    const [timeLeft, setTimeLeft] = React.useState('');

    React.useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const expiryDate = new Date(expiry);
            const hoursLeft = differenceInHours(expiryDate, now);

            if (hoursLeft <= 0) {
                setTimeLeft('Expired');
            } else {
                setTimeLeft(formatDistanceToNowStrict(expiryDate, { addSuffix: true }));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [expiry]);

    return <span>{timeLeft}</span>;
}


export default function VendorBidsPage() {
    const [allBids, setAllBids] = React.useState<Bid[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedBid, setSelectedBid] = React.useState<Bid | null>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        const unsubscribe = onBidsUpdate((bids) => {
            setAllBids(bids);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleBidPlaced = async (bidId: string, vendorBid: Omit<VendorBid, 'vendorId' | 'vendorName' | 'timestamp'>) => {
        try {
            await placeOrUpdateBid(bidId, VENDOR_ID, VENDOR_NAME, vendorBid);
            toast({ title: "Bid Submitted", description: "Your bid has been successfully placed." });
            setSelectedBid(null);
        } catch (error) {
            console.error("Failed to place bid:", error);
            toast({ title: "Error", description: "Could not place your bid.", variant: 'destructive' });
        }
    }

    const BidTable = ({ bids, showStatus }: { bids: Bid[], showStatus?: boolean }) => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bid ID</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>{showStatus ? 'Status' : 'Time Left'}</TableHead>
                            <TableHead>Competitors</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? Array.from({length: 3}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><div className="flex -space-x-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-8 w-8 rounded-full" /></div></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        )) : bids.map(bid => {
                            const vendorHasBid = bid.vendorResponses.some(vr => vr.vendorId === VENDOR_ID);
                            return (
                            <TableRow key={bid.id}>
                                <TableCell className="font-mono text-xs flex items-center gap-2">
                                     <span>{bid.id.slice(0,8)}...</span>
                                     {vendorHasBid && <Badge variant="secondary">Submitted</Badge>}
                                </TableCell>
                                <TableCell><ProductAvatars products={bid.products} /></TableCell>
                                <TableCell>
                                    {showStatus ? (
                                        <Badge variant={bid.status === 'Awarded' ? 'default' : 'outline'}>{bid.status}</Badge>
                                    ) : (
                                        <TimeLeft expiry={bid.dateExpires} />
                                    )}
                                </TableCell>
                                <TableCell>{bid.vendorResponses.length} vendors</TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant={vendorHasBid ? 'secondary' : 'default'} onClick={() => setSelectedBid(bid)} disabled={bid.status !== 'Active'}>
                                        {vendorHasBid ? 'Update Bid' : 'View Details'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )

    const activeBids = allBids.filter(b => b.status === 'Active');
    const awardedBids = allBids.filter(b => b.status === 'Awarded' && b.vendorResponses.some(vr => vr.vendorId === VENDOR_ID));
    const pastBids = allBids.filter(b => b.status === 'Expired');

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-bold">Corporate Bids</h1>
                <p className="text-muted-foreground">Discover and bid on high-volume corporate gift orders.</p>
            </div>
            <Tabs defaultValue="active" className="w-full">
                <TabsList>
                    <TabsTrigger value="active">Active Bids</TabsTrigger>
                    <TabsTrigger value="awarded">Awarded</TabsTrigger>
                    <TabsTrigger value="past">Past Bids</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-4">
                    <BidTable bids={activeBids} />
                </TabsContent>
                <TabsContent value="awarded" className="mt-4">
                    <BidTable bids={awardedBids} showStatus />
                </TabsContent>
                <TabsContent value="past" className="mt-4">
                     <BidTable bids={pastBids} showStatus />
                </TabsContent>
            </Tabs>
            
            {selectedBid && (
                 <PlaceBidDialog 
                    bid={selectedBid}
                    open={!!selectedBid}
                    onOpenChange={(isOpen) => !isOpen && setSelectedBid(null)}
                    onBidPlaced={handleBidPlaced}
                    vendorId={VENDOR_ID}
                 />
            )}
        </div>
    );
}
