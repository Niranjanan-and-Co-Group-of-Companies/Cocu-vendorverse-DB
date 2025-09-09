
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
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MOCK_WEBHOOKS = [
  { id: 'evt_1', service: 'Razorpay', event: 'payment.failed', status: 'Failed', receivedAt: new Date(Date.now() - 3600000) },
  { id: 'evt_2', service: 'Razorpay', event: 'payment.authorized', status: 'Success', receivedAt: new Date(Date.now() - 7200000) },
  { id: 'evt_3', service: 'Shiprocket', event: 'order.dispatched', status: 'Success', receivedAt: new Date(Date.now() - 86400000) },
  { id: 'evt_4', service: 'IDfy', event: 'kyc.failed', status: 'Failed', receivedAt: new Date(Date.now() - 172800000) },
  { id: 'evt_5', service: 'Razorpay', event: 'payout.processed', status: 'Success', receivedAt: new Date(Date.now() - 259200000) },
  { id: 'evt_6', service: 'Shiprocket', event: 'order.delivered', status: 'Success', receivedAt: new Date(Date.now() - 345600000) },
  { id: 'evt_7', service: 'Razorpay', event: 'payment.authorized', status: 'Success', receivedAt: new Date(Date.now() - 432000000) },
];


export default function WebhooksPage() {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Failed': return <XCircle className="h-5 w-5 text-destructive" />;
            default: return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        }
    };
    
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Webhook Events</h1>
                <p className="text-muted-foreground">A real-time log of incoming events from integrated services.</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Event ID</TableHead>
                                <TableHead className="text-right">Received</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_WEBHOOKS.map((hook) => (
                                <TableRow key={hook.id}>
                                    <TableCell>{getStatusIcon(hook.status)}</TableCell>
                                    <TableCell><Badge variant="outline">{hook.service}</Badge></TableCell>
                                    <TableCell className="font-medium">{hook.event}</TableCell>
                                    <TableCell className="font-mono text-xs">{hook.id}</TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs">
                                        {formatDistanceToNow(hook.receivedAt, { addSuffix: true })}
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

