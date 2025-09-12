
'use client';

import * as React from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/orders-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Truck } from 'lucide-react';
import Link from 'next/link';

function OrderDetailsPageContent({ id }: { id: string }) {
    const [order, setOrder] = React.useState<Order | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (id) {
            setLoading(true);
            const unsubscribe = onSnapshot(doc(db, 'orders', id), (docSnap) => {
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
                } else {
                    setOrder(null);
                }
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [id]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    
    const formatDate = (timestamp: any) => {
        if (timestamp?.toDate) {
            return timestamp.toDate().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
            });
        }
        return 'N/A';
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


    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!order) {
        return (
             <div className="text-center py-16">
                <h1 className="text-2xl font-bold">Order Not Found</h1>
                <p className="text-muted-foreground mt-2">The order you are looking for does not exist.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Link href="/account?tab=orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Orders
            </Link>

             <div>
                <h1 className="text-2xl font-bold font-headline">Order Details</h1>
                <p className="text-muted-foreground">Order ID: <span className="font-mono">{order.orderId}</span></p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Placed on {formatDate(order.date)}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(order.status)} className="text-base px-4 py-2">{order.status}</Badge>
                </CardHeader>
                <CardContent>
                    {/* Placeholder for status timeline component */}
                     <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{width: '66%'}}></div>
                     </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                         <CardHeader><CardTitle>Items in this order</CardTitle></CardHeader>
                         <CardContent>
                            {order.items.map((item, index) => (
                                <div key={item.id}>
                                    <div className="flex items-center gap-4">
                                        <Link href={`/products/${item.id}`}>
                                            <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md aspect-square object-cover"/>
                                        </Link>
                                        <div className="flex-grow">
                                            <Link href={`/products/${item.id}`} className="font-semibold hover:underline">{item.name}</Link>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(parseFloat(item.price) * item.quantity)}</p>
                                    </div>
                                    {index < order.items.length - 1 && <Separator className="my-4"/>}
                                </div>
                            ))}
                         </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                     <Card>
                        <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{formatCurrency(order.subtotal)}</span></div>
                             <div className="flex justify-between text-sm"><span>Shipping:</span><span>{formatCurrency(order.shipping)}</span></div>
                             <Separator />
                             <div className="flex justify-between font-bold"><span>Total:</span><span>{formatCurrency(order.total)}</span></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Shipping Information</CardTitle></CardHeader>
                        <CardContent>
                            <address className="not-italic text-sm">
                                {order.customer.shippingAddress.split(',').map(line => <span key={line} className="block">{line.trim()}</span>)}
                            </address>
                        </CardContent>
                    </Card>
                     <Button variant="outline" className="w-full"><FileText className="mr-2"/>Download Invoice</Button>
                </div>
            </div>
        </div>
    )
}


export default function CustomerOrderDetailsPage({ params: { id } }: { params: { id: string } }) {
    return (
        <React.Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <OrderDetailsPageContent id={id} />
        </React.Suspense>
    );
}
