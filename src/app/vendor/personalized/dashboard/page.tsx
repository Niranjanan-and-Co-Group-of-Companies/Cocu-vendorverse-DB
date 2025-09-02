
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Package,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

// Mock data for the dashboard
const stats = {
  totalRevenue: 45231.89,
  activeOrders: 12,
  newMessages: 5,
  activeListings: 78,
};

const recentActivities = [
  {
    customer: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d',
    type: 'New Order',
    details: 'Order #3124 for Artisanal Chocolate Box',
    amount: '+$250.00',
    link: '/vendor/personalized/orders/3124'
  },
  {
    customer: 'Jackson Lee',
    email: 'isabella.nguyen@email.com',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026705d',
    type: 'New Message',
    details: 'Question about Custom Engraved Pen',
    amount: '',
    link: '/vendor/personalized/messages/124'
  },
  {
    customer: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026706d',
    type: 'New Order',
    details: 'Order #3123 for Luxury Spa Set',
    amount: '+$150.00',
    link: '/vendor/personalized/orders/3123'
  },
  {
    customer: 'William Kim',
    email: 'will@email.com',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026707d',
    type: 'Stock Alert',
    details: 'Handcrafted Leather Wallet is low on stock (3 left)',
    amount: '',
    link: '/vendor/personalized/inventory'
  },
  {
    customer: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026708d',
    type: 'New Review',
    details: '5-star review for Gourmet Coffee Collection',
    amount: '',
    link: '/vendor/personalized/products/4'
  },
];

export default function VendorDashboard() {
  return (
    <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeOrders}</div>
                    <p className="text-xs text-muted-foreground">+3 from yesterday</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Messages</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats.newMessages}</div>
                    <p className="text-xs text-muted-foreground">2 need a reply</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeListings}</div>
                    <p className="text-xs text-muted-foreground">+2 since last hour</p>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        A log of recent sales, messages, and other store events.
                    </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/vendor/personalized/orders">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentActivities.map((activity, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="hidden h-9 w-9 sm:flex">
                                                <AvatarImage src={activity.avatar} alt="Avatar" data-ai-hint="avatar" />
                                                <AvatarFallback>{activity.customer.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-0.5">
                                                <div className="font-medium">{activity.customer}</div>
                                                <div className="hidden text-xs text-muted-foreground md:inline">
                                                    {activity.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <div className="text-xs text-muted-foreground">{activity.type}</div>
                                    </TableCell>
                                     <TableCell>
                                         <Link href={activity.link} className="hover:underline">
                                            {activity.details}
                                         </Link>
                                    </TableCell>
                                    <TableCell className="text-right">{activity.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
