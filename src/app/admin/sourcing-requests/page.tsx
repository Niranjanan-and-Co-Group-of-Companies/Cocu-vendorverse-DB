
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
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SourcingRequestDetailsDialog } from '@/components/admin/sourcing-requests/sourcing-request-details-dialog';
import { useToast } from '@/hooks/use-toast';
import { onSourcingRequestsUpdate } from '@/lib/sourcing-requests-client-service';
import { updateSourcingRequestStatus, type SourcingRequest } from '@/lib/sourcing-requests-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function SourcingRequestsPage() {
    const [requests, setRequests] = React.useState<SourcingRequest[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedRequest, setSelectedRequest] = React.useState<SourcingRequest | null>(null);
    const { toast } = useToast();
    
    React.useEffect(() => {
        const unsubscribe = onSourcingRequestsUpdate((data) => {
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

    const handleDownloadAttachments = (request: SourcingRequest) => {
        if(request.attachments && request.attachments.length > 0) {
            toast({ title: 'Downloading Attachments...', description: `Preparing to download ${request.attachments.length} file(s).` });
            request.attachments.forEach(file => {
                window.open(file.url, '_blank');
            });
        } else {
             toast({ title: 'No Attachments', description: 'This request has no attachments.', variant: 'destructive'});
        }
    }


    return (
        <>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Sourcing Requests</h1>
                    <p className="text-muted-foreground">
                        Manage custom product sourcing requests from corporate clients.
                    </p>
                </div>
                <Card>
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product Summary</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-mono text-xs">{request.id.slice(0,8)}...</TableCell>
                                        <TableCell className="font-medium">{request.contactName}</TableCell>
                                        <TableCell>{request.productDescription}</TableCell>
                                        <TableCell>{request.createdAt.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setSelectedRequest(request)}>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownloadAttachments(request)}>Download Attachments</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
