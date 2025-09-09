
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
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface WebhookEvent {
    id: string;
    service: string;
    event: string;
    status: 'Success' | 'Failed' | 'Pending';
    receivedAt: any; // Firestore Timestamp
}

export default function WebhooksPage() {
    const [events, setEvents] = React.useState<WebhookEvent[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const q = query(collection(db, 'webhookEvents'), orderBy('receivedAt', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WebhookEvent));
            setEvents(fetchedEvents);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-4 w-24" /></TableCell>
                                </TableRow>
                                ))
                            ) : events.map((hook) => (
                                <TableRow key={hook.id}>
                                    <TableCell>{getStatusIcon(hook.status)}</TableCell>
                                    <TableCell><Badge variant="outline">{hook.service}</Badge></TableCell>
                                    <TableCell className="font-medium">{hook.event}</TableCell>
                                    <TableCell className="font-mono text-xs">{hook.id}</TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs">
                                        {hook.receivedAt ? formatDistanceToNow(hook.receivedAt.toDate(), { addSuffix: true }) : 'N/A'}
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
