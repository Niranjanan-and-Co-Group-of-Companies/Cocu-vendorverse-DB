
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { onRmasUpdate } from '@/lib/admin/returns-client-service';
import type { RmaLog, RmaStatus } from '@/lib/returns-service';
import { RmaDetailsDialog } from '@/components/admin/returns/rma-details-dialog';

export default function AdminReturnsPage() {
    const [rmas, setRmas] = React.useState<RmaLog[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedRma, setSelectedRma] = React.useState<RmaLog | null>(null);

    React.useEffect(() => {
        const unsubscribe = onRmasUpdate((data) => {
            setRmas(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const getStatusVariant = (status: RmaStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
            case 'Pending Approval': return 'secondary';
            case 'Approved': return 'default';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };
    
    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return 'N/A';
        return format(timestamp.toDate(), "PPP");
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Return Requests (RMA)</h1>
                    <p className="text-muted-foreground">Review and process return requests from customers.</p>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>RMA ID</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : rmas.map((rma) => (
                                    <TableRow key={rma.id} className="cursor-pointer" onClick={() => setSelectedRma(rma)}>
                                        <TableCell className="font-mono text-xs">{rma.rmaId}</TableCell>
                                        <TableCell className="font-mono text-xs">{rma.orderReadableId}</TableCell>
                                        <TableCell>{rma.reason}</TableCell>
                                        <TableCell>{formatDate(rma.createdAt)}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(rma.status)}>{rma.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <RmaDetailsDialog 
                rma={selectedRma}
                isOpen={!!selectedRma}
                onOpenChange={(isOpen) => !isOpen && setSelectedRma(null)}
            />
        </>
    );
}
