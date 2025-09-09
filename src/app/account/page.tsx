
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getMockUser, type User } from '@/lib/user-service';
import { Skeleton } from '@/components/ui/skeleton';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/orders-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

// Component for Orders Tab
function OrdersTab() {
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // In a real app, this would use the current user's ID
        const userId = 'user001';
        const q = query(collection(db, 'orders'), where('customer.id', '==', userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(fetchedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return 'default';
            case 'Shipped': return 'default';
            case 'Processing':
            case 'Preparing':
            case 'Packaging':
            case 'Dispatched': return 'secondary';
            case 'Pending': return 'secondary';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>Your order history is displayed below.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>You haven't placed any orders yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/">Start Shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">#{order.id.substring(0, 8)}...</TableCell>
                                    <TableCell>{formatDate(order.date)}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(order.status)}>{order.status}</Badge></TableCell>
                                    <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="icon">
                                            <Link href={`/account/orders/${order.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

// Component for Designs Tab
function DesignsTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Saved Designs</CardTitle>
                <CardDescription>Your saved product customizations will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-8">
                    <p>You haven't saved any designs yet.</p>
                    <Button asChild className="mt-4">
                        <Link href="/">Browse Products to Customize</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Component for Addresses Tab
function AddressesTab() {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Addresses</CardTitle>
                <CardDescription>Manage your saved shipping and billing addresses.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-8">
                    <p>No addresses saved yet.</p>
                    <Button className="mt-4">Add New Address</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Component for Payment Methods Tab
function PaymentMethodsTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                 <CardDescription>Manage your saved payment options.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center text-muted-foreground py-8">
                    <p>No payment methods saved.</p>
                     <Button className="mt-4">Add Payment Method</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Component for Profile Settings Tab
function SettingsTab() {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                 <CardDescription>Update your personal information and communication preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Profile settings form will go here.</p>
            </CardContent>
        </Card>
    );
}


function AccountPageContent() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'dashboard';
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        getMockUser().then(userData => {
            setUser(userData);
            setLoading(false);
        });
    }, []);

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h1 className="text-3xl font-bold font-headline">My Account</h1>
                 {loading ? (
                    <Skeleton className="h-5 w-1/2 mt-2" />
                 ) : (
                    <p className="text-muted-foreground mt-2">
                        {user ? 'Welcome back, ' : 'Welcome, '}
                        {user?.name || 'Valued Customer'}! Manage your orders, designs, and settings.
                    </p>
                 )}
            </div>
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="designs">Designs</TabsTrigger>
                    <TabsTrigger value="addresses">Addresses</TabsTrigger>
                    <TabsTrigger value="payment-methods">Payments</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="orders" className="mt-6">
                    <OrdersTab />
                </TabsContent>
                <TabsContent value="designs" className="mt-6">
                    <DesignsTab />
                </TabsContent>
                <TabsContent value="addresses" className="mt-6">
                    <AddressesTab />
                </TabsContent>
                <TabsContent value="payment-methods" className="mt-6">
                    <PaymentMethodsTab />
                </TabsContent>
                 <TabsContent value="settings" className="mt-6">
                    <SettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function AccountPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <AccountPageContent />
        </React.Suspense>
    )
}
