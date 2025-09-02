
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { DollarSign, Package, PlusCircle, Search as SearchIcon, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/lib/orders-service';
import { onOrdersUpdate, updateOrderStatus } from '@/lib/orders-service';
import Link from 'next/link';
import { OrderActions } from '@/components/admin/orders/order-actions';
import { OrderDetailsDialog } from '@/components/admin/orders/order-details-dialog';


export default function OrdersPage() {
    const [allOrders, setAllOrders] = React.useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('all');
    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

    React.useEffect(() => {
        const unsubscribe = onOrdersUpdate((orders) => {
            setAllOrders(orders);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        let orders = [...allOrders];

        // Filter by tab
        if (activeTab !== 'all') {
            orders = orders.filter(order => order.status.toLowerCase() === activeTab);
        }

        // Filter by search query
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            orders = orders.filter(order => 
                order.id.toLowerCase().includes(lowerCaseQuery) ||
                order.customer.name.toLowerCase().includes(lowerCaseQuery) ||
                order.customer.email.toLowerCase().includes(lowerCaseQuery)
            );
        }

        setFilteredOrders(orders);
    }, [allOrders, activeTab, searchQuery]);

    const handleStatusChange = async (orderId: string, status: Order['status']) => {
        await updateOrderStatus(orderId, status);
        // Real-time listener will handle the UI update
    };
    
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const stats = React.useMemo(() => {
        const totalRevenue = allOrders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + o.total, 0);
        const pendingOrders = allOrders.filter(o => o.status === 'Pending').length;
        return {
            totalRevenue,
            totalOrders: allOrders.length,
            pendingOrders,
        };
    }, [allOrders]);
    
    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return 'default';
            case 'Shipped': return 'default';
            case 'Processing': return 'secondary';
            case 'Pending': return 'secondary';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    }
    
    const formatDate = (timestamp: any) => {
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return 'N/A';
    }


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Orders</h1>
                    <p className="text-muted-foreground">
                        Here you can view, track, and manage all orders.
                    </p>
                </div>
                <Button asChild>
                   <Link href="/admin/orders/new">
                        <PlusCircle className="mr-2" />
                        Create Order
                    </Link>
                </Button>
            </div>
            
            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {loading ? Array.from({length: 3}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-5 w-24 mb-2" /><Skeleton className="h-8 w-32" /></CardHeader>
                    </Card>
                )) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center justify-between">
                                    Total Revenue <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardTitle>
                                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center justify-between">
                                    Total Orders <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                </CardTitle>
                                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center justify-between">
                                    Pending Orders <Package className="h-4 w-4 text-muted-foreground" />
                                </CardTitle>
                                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                            </CardHeader>
                        </Card>
                    </>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center gap-4">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="processing">Processing</TabsTrigger>
                        <TabsTrigger value="shipped">Shipped</TabsTrigger>
                        <TabsTrigger value="delivered">Delivered</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                    <div className="relative ml-auto flex-1 md:grow-0">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by ID or customer..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value={activeTab}>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    )) : filteredOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}...</TableCell>
                                            <TableCell className="font-medium">{order.customer.name}</TableCell>
                                            <TableCell>{formatDate(order.date)}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                                            <TableCell className="text-right">
                                                <OrderActions
                                                    order={order}
                                                    onViewDetails={() => handleViewDetails(order)}
                                                    onStatusChange={handleStatusChange}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 {/* Repeat for other tabs - for brevity, only one is shown but logic handles all */}
                 <TabsContent value="pending"><p className="p-4 text-muted-foreground text-center">Filtered for Pending Orders.</p></TabsContent>
                 <TabsContent value="processing"><p className="p-4 text-muted-foreground text-center">Filtered for Processing Orders.</p></TabsContent>
                 <TabsContent value="shipped"><p className="p-4 text-muted-foreground text-center">Filtered for Shipped Orders.</p></TabsContent>
                 <TabsContent value="delivered"><p className="p-4 text-muted-foreground text-center">Filtered for Delivered Orders.</p></TabsContent>
                 <TabsContent value="cancelled"><p className="p-4 text-muted-foreground text-center">Filtered for Cancelled Orders.</p></TabsContent>
            </Tabs>
            
            <OrderDetailsDialog 
                order={selectedOrder} 
                open={!!selectedOrder} 
                onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
            />
        </div>
    );
}

    