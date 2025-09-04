
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Brush, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export default function AccountDashboardPage() {
    // These would be fetched from a service
    const stats = {
        activeOrders: 2,
        savedDesigns: 5,
        supportTickets: 1
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome back, Alex!</h1>
                <p className="text-muted-foreground mt-2">
                    Here's a quick overview of your account activity.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Package className="h-6 w-6 text-primary" />
                            <span>Active Orders</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.activeOrders}</p>
                        <Button asChild variant="link" className="p-0 h-auto">
                            <Link href="/account/orders">View Orders</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-3">
                            <Brush className="h-6 w-6 text-primary" />
                            <span>Saved Designs</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.savedDesigns}</p>
                        <Button asChild variant="link" className="p-0 h-auto">
                            <Link href="/account/designs">View Designs</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <LifeBuoy className="h-6 w-6 text-primary" />
                            <span>Support Tickets</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.supportTickets}</p>
                        <Button asChild variant="link" className="p-0 h-auto">
                            <Link href="/account/support">View Tickets</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recently Viewed</CardTitle>
                    <CardDescription>Pick up where you left off.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Placeholder for recently viewed products */}
                    <div className="text-center text-muted-foreground py-8">
                        <p>You haven't viewed any products recently.</p>
                        <Button asChild className="mt-4">
                            <Link href="/">Start Browsing</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
