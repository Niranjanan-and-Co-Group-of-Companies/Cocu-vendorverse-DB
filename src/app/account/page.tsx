
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Component for Orders Tab
function OrdersTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>Order history will be displayed here.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center text-muted-foreground py-8">
                    <p>You haven't placed any orders yet.</p>
                    <Button asChild className="mt-4">
                        <Link href="/">Start Shopping</Link>
                    </Button>
                </div>
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

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h1 className="text-3xl font-bold font-headline">My Account</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, Alex! Manage your orders, designs, and settings.
                </p>
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
