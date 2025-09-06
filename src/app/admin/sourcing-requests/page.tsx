
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

// Mock data, in a real app this would come from a service
const MOCK_REQUESTS = [
    { 
        id: 'SR001', 
        customer: { 
            name: 'Globex Corporation', 
            contact: { name: 'John Doe', email: 'john.doe@globex.com', phone: '555-123-4567' } 
        }, 
        date: '2023-10-27', 
        product: 'Matte black ceramic mugs with custom logo', 
        quantity: 500, 
        budgetPerItem: 12.50,
        requiredBy: '2023-11-30',
        status: 'New',
        notes: 'Logo must be printed on both sides. Pantone color: Cool Gray 11 C. Mugs should be 11oz and dishwasher safe.',
        attachments: [{ name: 'logo_guidelines.pdf', url: '#' }]
    },
    { 
        id: 'SR002', 
        customer: { 
            name: 'Stark Industries', 
            contact: { name: 'Pepper Potts', email: 'p.potts@stark-industries.net', phone: '555-987-6543' } 
        }, 
        date: '2023-10-26', 
        product: 'Leather notebooks with custom debossed logo', 
        quantity: 250, 
        budgetPerItem: 25.00,
        requiredBy: '2023-12-15',
        status: 'In Progress',
        notes: 'A5 size, ruled pages. Leather must be ethically sourced. Debossing should be subtle.',
        attachments: []
    },
    { 
        id: 'SR003', 
        customer: { 
            name: 'Wayne Enterprises', 
            contact: { name: 'Lucius Fox', email: 'l.fox@wayne-enterprises.com', phone: '555-222-3333' } 
        }, 
        date: '2023-10-24', 
        product: 'Eco-friendly tote bags with screen print', 
        quantity: 1000, 
        budgetPerItem: 8.00,
        requiredBy: '2023-11-20',
        status: 'Sourced',
        notes: 'Print on one side only. Must be made from recycled cotton.',
        attachments: [{ name: 'artwork.ai', url: '#' }]
    },
    { 
        id: 'SR004', 
        customer: { 
            name: 'Cyberdyne Systems', 
            contact: { name: 'Miles Dyson', email: 'm.dyson@cyberdyne.io', phone: '555-444-5555' } 
        }, 
        date: '2023-10-22', 
        product: 'Custom USB flash drives (16GB)', 
        quantity: 300, 
        budgetPerItem: 10.00,
        requiredBy: '2023-11-10',
        status: 'Closed',
        notes: 'Need a brushed metal finish.',
        attachments: []
    },
];

export type SourcingRequest = typeof MOCK_REQUESTS[0];

export default function SourcingRequestsPage() {
    const [requests, setRequests] = React.useState(MOCK_REQUESTS);
    const [selectedRequest, setSelectedRequest] = React.useState<SourcingRequest | null>(null);
    const { toast } = useToast();

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New': return 'destructive';
            case 'In Progress': return 'default';
            case 'Sourced': return 'secondary';
            case 'Closed': return 'outline';
            default: return 'outline';
        }
    };
    
    const handleStatusChange = (id: string, status: SourcingRequest['status']) => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        toast({ title: 'Status Updated', description: `Request ${id} marked as "${status}".` });
    };

    const handleDownloadAttachments = (request: SourcingRequest) => {
        if(request.attachments.length > 0) {
            toast({ title: 'Downloading Attachments...', description: `Preparing to download ${request.attachments.length} file(s).` });
            // In a real app, this would trigger actual downloads.
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
                                {requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-mono text-xs">{request.id}</TableCell>
                                        <TableCell className="font-medium">{request.customer.name}</TableCell>
                                        <TableCell>{request.product}</TableCell>
                                        <TableCell>{request.date}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'In Progress')}>Mark as 'In Progress'</DropdownMenuItem>
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
