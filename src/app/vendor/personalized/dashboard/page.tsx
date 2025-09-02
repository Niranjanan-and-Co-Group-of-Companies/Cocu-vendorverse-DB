
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
  MessageSquare,
  Check,
  X,
  Book,
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
  revenueChange: 20.1,
  activeOrders: 12,
  ordersChange: 3,
  newMessages: 5,
  activeListings: 78,
};

const recentActivities = [
  {
    customer: 'Olivia Martin',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d',
    type: 'New Order',
    details: 'Order #3124 for Artisanal Chocolate Box',
    time: '5m ago',
  },
  {
    customer: 'Jackson Lee',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026705d',
    type: 'New Message',
    details: 'Question about Custom Engraved Pen',
    time: '15m ago',
  },
  {
    customer: 'Liam Brown',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026709d',
    type: 'Action Required',
    details: 'Customer wants to buy "Handcrafted Leather Wallet". Please approve.',
    time: '30m ago',
    actionable: true,
  },
  {
    customer: 'Isabella Nguyen',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026706d',
    type: 'New Order',
    details: 'Order #3123 for Luxury Spa Set',
    time: '1h ago',
  },
  {
    customer: 'System',
    avatar: '',
    type: 'Stock Alert',
    details: 'Handcrafted Leather Wallet is low on stock (3 left)',
    time: '2h ago',
  },
];

export default function VendorDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.revenueChange}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">+{stats.ordersChange} from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
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

      {/* Section 2: Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
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
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-start gap-4">
                        <Avatar className="hidden h-10 w-10 sm:flex">
                          {activity.avatar && <AvatarImage src={activity.avatar} alt="Avatar" data-ai-hint="avatar" />}
                          <AvatarFallback>
                              {activity.type === 'Stock Alert' ? <Package /> : activity.customer.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <div className="font-medium">{activity.details}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.customer !== 'System' && `From ${activity.customer} •`} {activity.type}
                          </div>
                          {activity.actionable && (
                              <div className="flex gap-2 mt-1">
                                  <Button size="sm" variant="outline"><Check className="mr-2"/> Approve</Button>
                                  <Button size="sm" variant="destructive-outline"><X className="mr-2"/> Reject</Button>
                              </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{activity.time}</TableCell>
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
