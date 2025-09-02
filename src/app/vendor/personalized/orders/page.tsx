
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, OrderStatus } from '@/lib/orders-service';
import { onVendorOrdersUpdate, updateOrderStatus } from '@/lib/orders-service';
import { VendorOrderActions } from '@/components/vendor/orders/vendor-order-actions';
import { VendorOrderDetailsDialog } from '@/components/vendor/orders/vendor-order-details-dialog';

// In a real app, this would come from an auth context
const VENDOR_NAME = "Gourmet Delights"; 

export type VendorOrder = Order & {
    vendorTotal: number;
    vendorItemCount: number;
};

export default function VendorOrdersPage() {
    const [allOrders, setAllOrders] = React.useState<VendorOrder[]>([]);
    const [filteredOrders, setFilteredOrders] = React.useState<VendorOrder[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('all');
    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

    React.useEffect(() => {
        const unsubscribe = onVendorOrdersUpdate(VENDOR_NAME, (orders) => {
            setAllOrders(orders);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        let orders = [...allOrders];
        if (activeTab !== 'all') {
            const statuses: OrderStatus[] = activeTab.split(',') as OrderStatus[];
            orders = orders.filter(order => statuses.includes(order.status));
        }
        setFilteredOrders(orders);
    }, [allOrders, activeTab]);

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        await updateOrderStatus(orderId, status);
    };
    
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    
    const getStatusVariant = (status: OrderStatus) => {
        switch (status) {
            case 'Delivered':
            case 'Shipped': return 'default';
            case 'Processing':
            case 'Preparing':
            case 'Packaging':
            case 'Dispatched': return 'secondary';
            case 'Pending': return 'secondary';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    }
    
    const formatDate = (timestamp: any) => {
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return 'N/A';
    }

    const OrderTable = ({ orders, isLoading }: { orders: VendorOrder[], isLoading: boolean }) => (
         <Card className="mt-4">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Your Items</TableHead>
                            <TableHead>Your Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        )) : orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}...</TableCell>
                                <TableCell>{formatDate(order.date)}</TableCell>
                                <TableCell className="font-medium">{order.customer.name}</TableCell>
                                <TableCell>{order.vendorItemCount}</TableCell>
                                <TableCell>{formatCurrency(order.vendorTotal)}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <VendorOrderActions
                                        order={order}
                                        onViewDetails={() => handleViewDetails(order)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )


    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Orders</h1>
                <p className="text-muted-foreground">
                    View and fulfill all orders for your products.
                </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="Pending">New & Pending</TabsTrigger>
                    <TabsTrigger value="Preparing,Packaging,Dispatched">In Progress</TabsTrigger>
                    <TabsTrigger value="Shipped">Shipped</TabsTrigger>
                    <TabsTrigger value="Delivered,Cancelled">Completed & Cancelled</TabsTrigger>
                </TabsList>

                <OrderTable orders={filteredOrders} isLoading={loading} />
            </Tabs>
            
            <VendorOrderDetailsDialog
                order={selectedOrder}
                vendorName={VENDOR_NAME}
                open={!!selectedOrder}
                onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
