
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
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();

    React.useEffect(() => {
        const unsubscribe = onVendorOrdersUpdate(VENDOR_NAME, (orders) => {
            const retailOrders = orders.filter(order => 
                order.items.some(item => item.vendor === VENDOR_NAME && (!item.moq || item.moq <= 1))
            );
            setAllOrders(retailOrders);
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
        try {
            await updateOrderStatus(orderId, status);
            toast({
                title: "Order Status Updated",
                description: `Order #${orderId.slice(0,8)} has been marked as ${status}.`
            })
        } catch(e) {
            toast({
                title: "Error",
                description: "Failed to update order status.",
                variant: "destructive"
            })
        }
        setSelectedOrder(null); // Close the dialog on successful save
    };
    
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    
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
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Your Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10 rounded-md" /><Skeleton className="h-4 w-32" /></div></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        )) : orders.map(order => {
                             const vendorItems = order.items.filter(item => item.vendor === VENDOR_NAME);
                             const primaryItem = vendorItems[0];
                             const totalQuantity = vendorItems.reduce((sum, item) => sum + item.quantity, 0);
                            return (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}...</TableCell>
                                     <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image src={primaryItem.image} alt={primaryItem.name} width={40} height={40} className="rounded-md object-cover" />
                                            <div>
                                                <p className="font-medium">{primaryItem.name}</p>
                                                {vendorItems.length > 1 && (
                                                    <p className="text-xs text-muted-foreground">+{vendorItems.length - 1} more</p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>x{totalQuantity}</TableCell>
                                    <TableCell>{formatDate(order.date)}</TableCell>
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
                            )
                        })}
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
