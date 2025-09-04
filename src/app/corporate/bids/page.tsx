
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Bid, BidStatus } from '@/lib/bids-service';
import { onBidsUpdate } from '@/lib/bids-service';
import Link from 'next/link';

export default function BidsPage() {
    const [allBids, setAllBids] = React.useState<Bid[]>([]);
    const [filteredBids, setFilteredBids] = React.useState<Bid[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<BidStatus | 'all'>('all');

    React.useEffect(() => {
        const unsubscribe = onBidsUpdate((bids) => {
            // This would be filtered by the current corporate user's ID
            setAllBids(bids);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        let bids = [...allBids];
        if (activeTab !== 'all') {
            bids = bids.filter(bid => bid.status === activeTab);
        }
        setFilteredBids(bids);
    }, [allBids, activeTab]);

    const getStatusVariant = (status: BidStatus): 'default' | 'secondary' | 'destructive' => {
        switch (status) {
            case 'Active': return 'default';
            case 'Awarded': return 'secondary';
            case 'Expired': return 'destructive';
            default: return 'secondary';
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Your Bids</h1>
                    <p className="text-muted-foreground">
                        Track active bid requests and view responses from vendors.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/corporate/bids/new">
                        <PlusCircle className="mr-2" />
                        Create New Bid
                    </Link>
                </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="Active">Active</TabsTrigger>
                    <TabsTrigger value="Awarded">Awarded</TabsTrigger>
                    <TabsTrigger value="Expired">Expired</TabsTrigger>
                </TabsList>

                <Card className="mt-4">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bid ID</TableHead>
                                    <TableHead>Expires On</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Responses</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filteredBids.map(bid => (
                                    <TableRow key={bid.id}>
                                        <TableCell className="font-mono text-xs">{bid.id.slice(0, 8)}...</TableCell>
                                        <TableCell>{formatDate(bid.dateExpires)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(bid.status)}>{bid.status}</Badge>
                                        </TableCell>
                                        <TableCell>{bid.vendorResponses.length} vendors</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/corporate/bids/${bid.id}`}>View Details</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
