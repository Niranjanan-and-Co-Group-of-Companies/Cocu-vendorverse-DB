
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
import { Skeleton } from '@/components/ui/skeleton';
import { onDashboardStatsUpdate, onRecentActivityUpdate, type DashboardStats, type VendorNotification } from '@/lib/vendor/dashboard-service';
import { formatDistanceToNow } from 'date-fns';

const iconMap: { [key: string]: React.ElementType } = {
  NEW_ORDER: Package,
  NEW_MESSAGE: MessageSquare,
  STOCK_ALERT: Activity,
  ACTION_REQUIRED: Users,
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

export default function VendorDashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = React.useState<VendorNotification[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingActivities, setLoadingActivities] = React.useState(true);
  
  // Hardcoded vendor ID for now. In a real app, this would come from auth context.
  const VENDOR_NAME = "Gourmet Delights"; 

  React.useEffect(() => {
    const unsubStats = onDashboardStatsUpdate(VENDOR_NAME, (newStats) => {
      setStats(newStats);
      setLoadingStats(false);
    });

    const unsubActivities = onRecentActivityUpdate(VENDOR_NAME, (activities) => {
        setRecentActivities(activities);
        setLoadingActivities(false);
    });

    return () => {
      unsubStats();
      unsubActivities();
    };
  }, [VENDOR_NAME]);

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
            {loadingStats ? (
                <>
                    <Skeleton className="h-8 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</div>
                    <p className="text-xs text-muted-foreground">{formatPercentage(stats?.revenueChange ?? 0)} from last month</p>
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
                <>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{stats?.activeOrders ?? 0}</div>
                    <p className="text-xs text-muted-foreground">+{stats?.newOrdersToday ?? 0} from yesterday</p>
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
                <>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">+{stats?.unreadMessages ?? 0}</div>
                    <p className="text-xs text-muted-foreground">{stats?.actionableMessages ?? 0} need a reply</p>
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
                <>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{stats?.activeListings ?? 0}</div>
                    <p className="text-xs text-muted-foreground">{stats?.draftListings ?? 0} in draft</p>
                </>
            )}
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
             {loadingActivities ? (
                 <div className="space-y-4">
                    {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1 flex-grow">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                 </div>
            ) : recentActivities.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>No recent activity.</p>
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivities.map((activity) => {
                        const Icon = iconMap[activity.type] || Activity;
                        return (
                        <TableRow key={activity.id}>
                            <TableCell>
                            <div className="flex items-start gap-4">
                                <Avatar className="hidden h-10 w-10 sm:flex">
                                {activity.actor?.avatar && <AvatarImage src={activity.actor.avatar} alt="Avatar" data-ai-hint="avatar" />}
                                <AvatarFallback>
                                    <Icon className="h-5 w-5" />
                                </AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <div className="font-medium">{activity.text}</div>
                                <div className="text-xs text-muted-foreground">
                                    {activity.actor && `From ${activity.actor.name} • `} {activity.type.replace(/_/g, ' ')}
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
                            <TableCell className="text-right text-xs text-muted-foreground">
                                {activity.timestamp && formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                            </TableCell>
                        </TableRow>
                        )}
                    )}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

