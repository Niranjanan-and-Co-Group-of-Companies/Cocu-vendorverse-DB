
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, ShoppingCart, UserPlus, FileEdit, Shield, Package } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';

// Interfaces for our data
interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  timestamp: any;
}
interface HomepageContent {
    id: string;
    name: string;
    status: 'Active' | 'Create';
}

interface AdminNotification {
    id: string;
    type: string;
    text: string;
    time: string;
    icon: React.ElementType;
    link: string;
}


export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [newSignups, setNewSignups] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [activeVendors, setActiveVendors] = useState(0);

    const [revenueChange, setRevenueChange] = useState(0);
    const [signupsChange, setSignupsChange] = useState(0);
    const [ordersChange, setOrdersChange] = useState(0);
    
    const [recentSales, setRecentSales] = useState<Order[]>([]);
    const [homepageContent, setHomepageContent] = useState<HomepageContent[]>([]);
    const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const now = new Date();
            const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            
            const startOfCurrentMonthTs = Timestamp.fromDate(startOfCurrentMonth);
            const startOfPreviousMonthTs = Timestamp.fromDate(startOfPreviousMonth);
            const startOfTwoMonthsAgoTs = Timestamp.fromDate(startOfTwoMonthsAgo);

            // Fetch stats for current month
            const ordersCurrentMonthQuery = query(collection(db, 'orders'), where('timestamp', '>=', startOfCurrentMonthTs));
            const usersCurrentMonthQuery = query(collection(db, 'users'), where('createdAt', '>=', startOfCurrentMonthTs));
            
            // Fetch stats for previous month
            const ordersPreviousMonthQuery = query(collection(db, 'orders'), where('timestamp', '>=', startOfPreviousMonthTs), where('timestamp', '<', startOfCurrentMonthTs));
            const usersPreviousMonthQuery = query(collection(db, 'users'), where('createdAt', '>=', startOfPreviousMonthTs), where('createdAt', '<', startOfCurrentMonthTs));
            
            const [
                ordersCurrentMonthSnapshot, 
                usersCurrentMonthSnapshot, 
                ordersPreviousMonthSnapshot, 
                usersPreviousMonthSnapshot,
                vendorsSnapshot
            ] = await Promise.all([
                getDocs(ordersCurrentMonthQuery),
                getDocs(usersCurrentMonthQuery),
                getDocs(ordersPreviousMonthQuery),
                getDocs(usersPreviousMonthQuery),
                getDocs(collection(db, 'vendors'))
            ]);

            // Calculate current month's stats
            let revenueCurrentMonth = 0;
            ordersCurrentMonthSnapshot.forEach(doc => {
                const orderData = doc.data();
                const price = parseFloat(orderData.price?.replace('$', '')) || 0;
                revenueCurrentMonth += price;
            });
            const ordersCurrentMonth = ordersCurrentMonthSnapshot.size;
            const signupsCurrentMonth = usersCurrentMonthSnapshot.size;
            
            // Calculate previous month's stats
            let revenuePreviousMonth = 0;
            ordersPreviousMonthSnapshot.forEach(doc => {
                const orderData = doc.data();
                const price = parseFloat(orderData.price?.replace('$', '')) || 0;
                revenuePreviousMonth += price;
            });
            const ordersPreviousMonth = ordersPreviousMonthSnapshot.size;
            const signupsPreviousMonth = usersPreviousMonthSnapshot.size;

            // Set totals
            setTotalRevenue(revenueCurrentMonth);
            setTotalOrders(ordersCurrentMonth);
            setNewSignups(signupsCurrentMonth);
            setActiveVendors(vendorsSnapshot.size);

            // Calculate percentage changes
            const calcChange = (current: number, previous: number) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return ((current - previous) / previous) * 100;
            };

            setRevenueChange(calcChange(revenueCurrentMonth, revenuePreviousMonth));
            setOrdersChange(calcChange(ordersCurrentMonth, ordersPreviousMonth));
            setSignupsChange(calcChange(signupsCurrentMonth, signupsPreviousMonth));
            
            // Fetch recent sales
            const recentSalesQuery = query(collection(db, 'orders'), orderBy('timestamp', 'desc'), limit(5));
            const recentSalesSnapshot = await getDocs(recentSalesQuery);
            const salesData = recentSalesSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    customer: {
                        name: data.customerName || 'N/A',
                        email: data.customerEmail || 'N/A',
                        avatar: data.customerAvatar || `https://avatar.vercel.sh/${data.customerEmail}`
                    },
                    amount: parseFloat(data.price?.replace('$', '')) || 0,
                    timestamp: data.timestamp,
                }
            }) as Order[];
            setRecentSales(salesData);

            // Mocked data for Homepage Content and Notifications as these collections don't exist yet
            setHomepageContent([
                { id: 'hero-personal', name: 'Main Hero Carousel (Personal)', status: 'Active' },
                { id: 'hero-corporate', name: 'Corporate Hero Carousel (B2B)', status: 'Create' },
                { id: 'announcement-banner', name: 'Top Announcement Banner', status: 'Active' },
            ]);
            setAdminNotifications([
                { id: '1', type: 'New Vendor', text: "New vendor 'Creative Crafts' is awaiting verification.", time: '15m ago', icon: UserPlus, link: '#' },
                { id: '2', type: 'User Report', text: "User 'jane_doe' reported a product.", time: '30m ago', icon: Shield, link: '#' },
                { id: '3', type: 'Content Update', text: "The 'About Us' page needs review.", time: '1h ago', icon: FileEdit, link: '#' },
            ]);


            setLoading(false);
        }
        fetchData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    }
    
    const formatPercentage = (value: number) => {
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}% from last month`;
    }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
            Array.from({length: 4}).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-full" />
                    </CardContent>
                </Card>
            ))
        ) : (
          <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">{formatPercentage(revenueChange)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Sign-ups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">+{newSignups}</div>
                <p className="text-xs text-muted-foreground">{formatPercentage(signupsChange)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">+{totalOrders}</div>
                <p className="text-xs text-muted-foreground">{formatPercentage(ordersChange)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">+{activeVendors}</div>
                <p className="text-xs text-muted-foreground">+2 since last hour</p>
                </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Sales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made {totalOrders} sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
                <div className="space-y-4">
                    {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/5" />
                                <Skeleton className="h-3 w-2/5" />
                            </div>
                            <Skeleton className="h-5 w-1/6" />
                        </div>
                    ))}
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={sale.customer.avatar} alt="Avatar" data-ai-hint="avatar" />
                          <AvatarFallback>{sale.customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{sale.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(sale.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        {/* Admin Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <CardDescription>Live feed of events needing your attention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {loading ? (
                <div className="space-y-4">
                    {Array.from({length: 3}).map((_, i) => (
                         <div key={i} className="flex items-start gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
            <>
                {adminNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-4">
                        <div className="bg-muted rounded-full p-2">
                            <notification.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium leading-none">
                                <Link href={notification.link} className="hover:underline">
                                    {notification.text}
                                </Link>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                            </p>
                        </div>
                    </div>
                ))}
                <Button variant="outline" className="w-full">
                    View All Notifications
                </Button>
            </>
            )}
          </CardContent>
        </Card>
      </div>
      
       {/* Homepage Content Management */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage Content</CardTitle>
          <CardDescription>Manage promotional content on the public homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homepageContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                      {item.status === 'Active' ? 'Active' : 'Empty'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === 'Active' ? (
                       <Button variant="outline" size="sm" asChild>
                         <Link href="/admin/marketing">Manage</Link>
                       </Button>
                    ) : (
                      <Button variant="default" size="sm" asChild>
                         <Link href="/admin/marketing/new">Create</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
