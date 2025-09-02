
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
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Hourglass, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Bid, BidStatus } from '@/lib/bids-service';
import { onBidsUpdate } from '@/lib/bids-service';
import { BidActions } from '@/components/admin/bids/bid-actions';
import { BidDetailsDialog } from '@/components/admin/bids/bid-details-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function BidsPage() {
    const [allBids, setAllBids] = React.useState<Bid[]>([]);
    const [filteredBids, setFilteredBids] = React.useState<Bid[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<BidStatus | 'all'>('all');
    const [selectedBid, setSelectedBid] = React.useState<Bid | null>(null);

    React.useEffect(() => {
        const unsubscribe = onBidsUpdate((bids) => {
            setAllBids(bids);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        let bids = [...allBids];

        if (activeTab !== 'all') {
            bids = bids.filter(bid => bid.status.toLowerCase() === activeTab);
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            bids = bids.filter(bid => 
                bid.id.toLowerCase().includes(lowerCaseQuery) ||
                bid.vendorResponses.some(vr => vr.vendorName.toLowerCase().includes(lowerCaseQuery))
            );
        }

        setFilteredBids(bids);
    }, [allBids, activeTab, searchQuery]);

    const handleViewDetails = (bid: Bid) => {
        setSelectedBid(bid);
    };

    const getStatusInfo = (status: BidStatus): { variant: 'default' | 'secondary' | 'destructive', icon: React.ElementType } => {
        switch (status) {
            case 'Active': return { variant: 'default', icon: Hourglass };
            case 'Awarded': return { variant: 'secondary', icon: CheckCircle };
            case 'Expired': return { variant: 'destructive', icon: XCircle };
            default: return { variant: 'secondary', icon: Hourglass };
        }
    }

    const ProductAvatars = ({ products }: { products: Bid['products'] }) => (
        <div className="flex -space-x-2 overflow-hidden">
            {products.slice(0, 3).map((p, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-card">
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


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Corporate Bids</h1>
                    <p className="text-muted-foreground">
                        Monitor and manage all corporate bid requests.
                    </p>
                </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <div className="flex items-center gap-4">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="Active">Active</TabsTrigger>
                        <TabsTrigger value="Awarded">Awarded</TabsTrigger>
                        <TabsTrigger value="Expired">Expired</TabsTrigger>
                    </TabsList>
                    <div className="relative ml-auto flex-1 md:grow-0">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by ID or Vendor..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="mt-4">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bid ID</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Responses</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><div className="flex -space-x-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-8 w-8 rounded-full" /></div></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filteredBids.map(bid => {
                                    const statusInfo = getStatusInfo(bid.status);
                                    return (
                                    <TableRow key={bid.id}>
                                        <TableCell className="font-mono text-xs">{bid.id}</TableCell>
                                        <TableCell>
                                            <ProductAvatars products={bid.products} />
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant}>
                                                <statusInfo.icon className="mr-2 h-4 w-4" />
                                                {bid.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{bid.vendorResponses.length} vendors</TableCell>
                                        <TableCell className="text-right">
                                            <BidActions
                                                bid={bid}
                                                onViewDetails={() => handleViewDetails(bid)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Tabs>
            
            <BidDetailsDialog 
                bid={selectedBid} 
                open={!!selectedBid} 
                onOpenChange={(isOpen) => !isOpen && setSelectedBid(null)}
            />
        </div>
    );
}
