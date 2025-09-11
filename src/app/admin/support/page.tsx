
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
import { LifeBuoy, Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { SupportTicket } from '@/lib/vendor/support-service';
import { onAllTicketsUpdate } from '@/lib/admin/support-client-service';
import { formatDistanceToNow } from 'date-fns';
import { SupportTicketDetailsDialog } from '@/components/admin/support/support-ticket-details-dialog';

export default function AdminSupportPage() {
    const [allTickets, setAllTickets] = React.useState<SupportTicket[]>([]);
    const [filteredTickets, setFilteredTickets] = React.useState<SupportTicket[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('open');
    const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
    const [stats, setStats] = React.useState({ open: 0, waiting: 0, urgent: 0, resolvedToday: 0 });

    React.useEffect(() => {
        const unsubscribe = onAllTicketsUpdate((tickets) => {
            setAllTickets(tickets);
            
            const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
            const waitingOnVendor = tickets.filter(t => t.status === 'Waiting on Vendor').length;
            const urgentTickets = tickets.filter(t => t.priority === 'Urgent' && (t.status === 'Open' || t.status === 'In Progress')).length;
            // In a real app, "today" would be handled more robustly with timezones
            const resolvedToday = tickets.filter(t => t.status === 'Resolved' && t.lastUpdated.toDate().toDateString() === new Date().toDateString()).length;

            setStats({ open: openTickets, waiting: waitingOnVendor, urgent: urgentTickets, resolvedToday });
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        let tickets = [...allTickets];

        if (activeTab !== 'all') {
            const statuses: SupportTicket['status'][] = activeTab === 'open' ? ['Open', 'In Progress'] : [activeTab as SupportTicket['status']];
            tickets = tickets.filter(ticket => statuses.includes(ticket.status));
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            tickets = tickets.filter(ticket => 
                ticket.subject.toLowerCase().includes(lowerCaseQuery) ||
                ticket.vendorId.toLowerCase().includes(lowerCaseQuery) || // Assuming vendor name is not stored, search by ID
                ticket.id.toLowerCase().includes(lowerCaseQuery)
            );
        }

        setFilteredTickets(tickets);
    }, [allTickets, activeTab, searchQuery]);

    const getStatusVariant = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return 'default';
            case 'In Progress': return 'secondary';
            case 'Waiting on Vendor': return 'outline';
            case 'Resolved': return 'outline';
            default: return 'default';
        }
    };
    
    const getPriorityVariant = (priority: SupportTicket['priority']) => {
        return priority === 'Urgent' ? 'destructive' : 'secondary';
    };
    
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Support Center</h1>
                    <p className="text-muted-foreground">Monitor and manage all vendor support tickets.</p>
                </div>
                
                {/* Stat Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>{loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stats.open}</div>}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Waiting on Vendor</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>{loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stats.waiting}</div>}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>{loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stats.urgent}</div>}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>{loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stats.resolvedToday}</div>}</CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-center gap-4">
                        <TabsList>
                            <TabsTrigger value="open">Open</TabsTrigger>
                            <TabsTrigger value="Waiting on Vendor">Waiting on Vendor</TabsTrigger>
                            <TabsTrigger value="Resolved">Resolved</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                        <div className="relative ml-auto flex-1 md:grow-0">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by subject, vendor, ID..."
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
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Last Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? Array.from({length: 10}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                        </TableRow>
                                    )) : filteredTickets.map(ticket => (
                                        <TableRow key={ticket.id} className="cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                                            <TableCell className="font-medium">{ticket.vendorId}</TableCell>
                                            <TableCell>{ticket.subject}</TableCell>
                                            <TableCell><Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge></TableCell>
                                            <TableCell><Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge></TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">{formatDate(ticket.lastUpdated)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
            <SupportTicketDetailsDialog 
                ticket={selectedTicket}
                isOpen={!!selectedTicket}
                onOpenChange={() => setSelectedTicket(null)}
            />
        </>
    );
}
