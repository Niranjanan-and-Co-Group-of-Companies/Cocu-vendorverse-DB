
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
import { MoreHorizontal, Download } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data, in a real app this would come from a service
const MOCK_REQUESTS = [
    { id: 'SR001', customer: 'Globex Corporation', date: '2023-10-27', product: 'Matte black ceramic mugs', quantity: 500, status: 'New' },
    { id: 'SR002', customer: 'Stark Industries', date: '2023-10-26', product: 'Leather notebooks with custom logo', quantity: 250, status: 'In Progress' },
    { id: 'SR003', customer: 'Wayne Enterprises', date: '2023-10-24', product: 'Eco-friendly tote bags', quantity: 1000, status: 'Sourced' },
    { id: 'SR004', customer: 'Cyberdyne Systems', date: '2023-10-22', product: 'Custom USB flash drives', quantity: 300, status: 'Closed' },
];

export default function SourcingRequestsPage() {

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New': return 'destructive';
            case 'In Progress': return 'default';
            case 'Sourced': return 'secondary';
            case 'Closed': return 'outline';
            default: return 'outline';
        }
    };

    return (
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
                            {MOCK_REQUESTS.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-mono text-xs">{request.id}</TableCell>
                                    <TableCell className="font-medium">{request.customer}</TableCell>
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
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Mark as 'In Progress'</DropdownMenuItem>
                                                <DropdownMenuItem>Download Attachments</DropdownMenuItem>
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
    );
}
