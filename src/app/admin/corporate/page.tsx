
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { onCorporateClientsUpdate, type CorporateClient } from '@/lib/corporate-clients-service';
import { AddClientDialog } from '@/components/admin/corporate/add-client-dialog';
import { ClientActions } from '@/components/admin/corporate/client-actions';

export default function CorporatePage() {
    const [clients, setClients] = React.useState<CorporateClient[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editingClient, setEditingClient] = React.useState<CorporateClient | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);


    React.useEffect(() => {
        const unsubscribe = onCorporateClientsUpdate((data) => {
            setClients(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleEdit = (client: CorporateClient) => {
        setEditingClient(client);
        // The dialog will be opened by the action component, but we set the state here.
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const getStatusVariant = (status: CorporateClient['status']) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Inactive': return 'secondary';
            case 'Pending': return 'outline';
            default: return 'outline';
        }
    };

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Manage Corporate Clients</h1>
                <p className="text-muted-foreground">Here you can manage corporate accounts and campaigns.</p>
            </div>
             <AddClientDialog>
                <Button>
                    <PlusCircle className="mr-2" />
                    Add Client
                </Button>
            </AddClientDialog>
        </div>

        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? Array.from({length: 4}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><div className="space-y-1"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        )) : clients.map(client => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{client.contactPerson}</div>
                                    <div className="text-sm text-muted-foreground">{client.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(client.status)}>{client.status}</Badge>
                                </TableCell>
                                <TableCell>{formatCurrency(client.totalSpent)}</TableCell>
                                <TableCell className="text-right">
                                    <AddClientDialog client={client}>
                                        <ClientActions client={client} onEdit={() => {}} />
                                    </AddClientDialog>
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
