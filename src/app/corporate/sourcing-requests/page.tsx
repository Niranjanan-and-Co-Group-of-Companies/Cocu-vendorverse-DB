
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { onCustomerSourcingRequestsUpdate } from '@/lib/sourcing-requests-client-service';
import type { SourcingRequest } from '@/lib/sourcing-requests-service';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { SourcingRequestDetailsDialog } from '@/components/admin/sourcing-requests/sourcing-request-details-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateSourcingRequestStatus } from '@/lib/sourcing-requests-service';

// In a real app, this would come from an auth context.
const CUSTOMER_ID = 'corp-123';

export default function CorporateSourcingRequestsPage() {
    const [requests, setRequests] = React.useState<SourcingRequest[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedRequest, setSelectedRequest] = React.useState<SourcingRequest | null>(null);
    const { toast } = useToast();
    
    React.useEffect(() => {
        const unsubscribe = onCustomerSourcingRequestsUpdate(CUSTOMER_ID, (data) => {
            setRequests(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New': return 'destructive';
            case 'In Progress': return 'default';
            case 'Sourced': return 'secondary';
            case 'Closed': return 'outline';
            default: return 'outline';
        }
    };
    
    const handleStatusChange = async (id: string, status: SourcingRequest['status']) => {
        try {
            await updateSourcingRequestStatus(id, status);
            toast({ title: 'Status Updated', description: `Request ${id} marked as "${status}".` });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive'});
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Your Sourcing Requests</h1>
                        <p className="text-muted-foreground">
                            Track the status of your custom product sourcing requests.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/corporate/sourcing-requests/new">
                            <PlusCircle className="mr-2" />
                            Create New Request
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Product Summary</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-mono text-xs">{request.id.slice(0,8)}...</TableCell>
                                        <TableCell>{request.productDescription}</TableCell>
                                        <TableCell>{request.createdAt.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>View Details</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <SourcingRequestDetailsDialog
                request={selectedRequest}
                open={!!selectedRequest}
                onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}
                onStatusChange={handleStatusChange}
            />
        </>
    );
}
