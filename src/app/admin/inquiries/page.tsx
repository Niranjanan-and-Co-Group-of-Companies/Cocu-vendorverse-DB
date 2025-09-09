
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
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Inquiry {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: Timestamp;
    status: 'New' | 'Read' | 'Archived';
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = React.useState<Inquiry[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const q = query(collection(db, 'contactSubmissions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
            setInquiries(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (id: string, status: Inquiry['status']) => {
        const docRef = doc(db, 'contactSubmissions', id);
        await updateDoc(docRef, { status });
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Form Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Received</TableHead>
                                <TableHead className="w-[150px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40" /></div></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-9 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : inquiries.map((inquiry) => (
                                <TableRow key={inquiry.id}>
                                    <TableCell>
                                        <div className="font-medium">{inquiry.name}</div>
                                        <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                                    </TableCell>
                                    <TableCell className="whitespace-pre-line">{inquiry.message}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</TableCell>
                                    <TableCell>
                                        <Select value={inquiry.status} onValueChange={(value) => handleStatusChange(inquiry.id, value as Inquiry['status'])}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="New"><Badge variant="default" className="mr-2" />New</SelectItem>
                                                <SelectItem value="Read"><Badge variant="secondary" className="mr-2" />Read</SelectItem>
                                                <SelectItem value="Archived"><Badge variant="outline" className="mr-2" />Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
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
