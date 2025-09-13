
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getMockUser, type User, updateUserContact } from '@/lib/user-service';
import { Skeleton } from '@/components/ui/skeleton';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/orders-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

function EditableProfileField({ label, initialValue, onSave }: { label: string; initialValue: string; onSave: (newValue: string) => Promise<void>}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(value);
    setIsSaving(false);
    setIsEditing(false);
  };
  
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input value={value} onChange={e => setValue(e.target.value)} readOnly={!isEditing} />
        {isEditing ? (
          <>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin"/> : null}
                Save
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </div>
    </div>
  );
}


// Component for Orders Tab
function OrdersTab() {
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        getMockUser().then(setCurrentUser);
    }, []);

    React.useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, 'orders'), where('customer.id', '==', currentUser.id), where('platform', '==', 'Personalized'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(fetchedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);
    
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
                                    <TableCell className="font-mono">{order.orderId}</TableCell>
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
     const [user, setUser] = React.useState<User | null>(null);
     const [loading, setLoading] = React.useState(true);
     const { toast } = useToast();

     React.useEffect(() => {
        getMockUser().then(userData => {
            setUser(userData);
            setLoading(false);
        });
    }, []);

    const handleSave = async (field: 'name' | 'email' | 'phone', value: string) => {
        if (!user) return;
        try {
            await updateUserContact(user.id, field, value);
            setUser(prev => prev ? { ...prev, [field]: value } : null);
            toast({ title: 'Profile Updated', description: `Your ${field} has been updated.` });
        } catch (error) {
            toast({ title: 'Error', description: 'Could not update your profile.', variant: 'destructive' });
        }
    }
     
     if(loading) {
         return <Skeleton className="h-64 w-full" />
     }

     return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                 <CardDescription>Update your personal information and communication preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <EditableProfileField label="Full Name" initialValue={user?.name || ''} onSave={(newValue) => handleSave('name', newValue)} />
                <EditableProfileField label="Email Address" initialValue={user?.email || ''} onSave={(newValue) => handleSave('email', newValue)} />
                <EditableProfileField label="Phone Number" initialValue={user?.phone || ''} onSave={(newValue) => handleSave('phone', newValue)} />
            </CardContent>
        </Card>
    );
}


function AccountPageContent() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'orders';
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
