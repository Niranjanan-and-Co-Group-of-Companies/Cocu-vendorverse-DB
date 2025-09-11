
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/orders-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Building, User, KeyRound } from 'lucide-react';
import { useCorporateAccount } from '@/hooks/use-corporate-account-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// In a real app, this would come from an auth context.
const MOCK_USER_ID = 'corp-123';
const MOCK_USER_NAME = 'John Smith';

// --- Tab Components ---

function CorporateOrdersTab() {
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const q = query(collection(db, 'orders'), where('customer.id', '==', MOCK_USER_ID));
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
                <CardTitle>My Order History</CardTitle>
                <CardDescription>Your corporate order history is displayed below.</CardDescription>
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
                        <p>You haven't placed any corporate orders yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/corporate/products">Start Shopping</Link>
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

function ProfileSettingsTab() {
    return (
       <Card>
           <CardHeader>
               <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and password.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={MOCK_USER_NAME} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.smith@globex.com" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+91 98765 43210" />
                </div>
                 <div className="space-y-2 pt-4 border-t">
                     <div className="flex items-center gap-2">
                        <KeyRound className="text-muted-foreground" />
                        <h4 className="font-medium">Change Password</h4>
                     </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input type="password" placeholder="Current Password" />
                        <Input type="password" placeholder="New Password" />
                    </div>
                </div>
           </CardContent>
       </Card>
   );
}


function CompanyDetailsTab() {
    const { account, isLoading } = useCorporateAccount();
    
    if (isLoading) {
        return <Skeleton className="h-64 w-full" />
    }

    return (
       <Card>
           <CardHeader>
               <CardTitle>Company Details</CardTitle>
                <CardDescription>This information is managed by your company admin.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Company Name</Label>
                    <p className="font-semibold text-muted-foreground">{account?.name || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                    <Label>GSTIN</Label>
                    <p className="font-semibold text-muted-foreground">{account?.gstProfile?.gstin || 'Not Provided'}</p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/corporate/settings">View Full Company Settings</Link>
                </Button>
           </CardContent>
       </Card>
   );
}


function CorporateAccountPageContent() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'orders';

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Corporate Account</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {MOCK_USER_NAME}! Manage your corporate orders and settings.
                </p>
            </div>
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="orders"><ShoppingCart className="mr-2" />Orders</TabsTrigger>
                    <TabsTrigger value="profile"><User className="mr-2"/>Profile Settings</TabsTrigger>
                    <TabsTrigger value="company"><Building className="mr-2"/>Company Details</TabsTrigger>
                </TabsList>
                <TabsContent value="orders" className="mt-6">
                    <CorporateOrdersTab />
                </TabsContent>
                <TabsContent value="profile" className="mt-6">
                    <ProfileSettingsTab />
                </TabsContent>
                <TabsContent value="company" className="mt-6">
                    <CompanyDetailsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function CorporateAccountsPage() {
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full"/>}>
            <CorporateAccountPageContent />
        </React.Suspense>
    )
}
