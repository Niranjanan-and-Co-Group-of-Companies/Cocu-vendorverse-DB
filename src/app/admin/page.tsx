
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
import { ArrowUp, DollarSign, Users, ShoppingCart, Megaphone, Shield, UserPlus, FileEdit } from 'lucide-react';
import Link from 'next/link';

// Mock data - in a real app, this would come from a database
const stats = {
  totalRevenue: { value: '$45,231.89', change: '+20.1% from last month', icon: DollarSign },
  newSignups: { value: '+2350', change: '+180.1% from last month', icon: Users },
  totalOrders: { value: '+12,234', change: '+19% from last month', icon: ShoppingCart },
  activeVendors: { value: '+573', change: '+201 since last hour', icon: UserPlus },
};

const recentSales = [
    { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '$1,999.00', avatar: 'https://picsum.photos/40?random=10' },
    { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '$39.00', avatar: 'https://picsum.photos/40?random=11' },
    { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '$299.00', avatar: 'https://picsum.photos/40?random=12' },
    { name: 'William Kim', email: 'will@email.com', amount: '$99.00', avatar: 'https://picsum.photos/40?random=13' },
    { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '$39.00', avatar: 'https://picsum.photos/40?random=14' },
];

const homepageContent = [
    { id: 'hero-personal', name: 'Main Hero Carousel (Personal)', status: 'Active', statusVariant: 'default' },
    { id: 'hero-corporate', name: 'Corporate Hero Carousel (B2B)', status: 'Create', statusVariant: 'secondary' },
    { id: 'announcement-banner', name: 'Top Announcement Banner', status: 'Active', statusVariant: 'default' },
];

const adminNotifications = [
    { type: 'New Vendor', text: "New vendor 'Creative Crafts' has signed up and is awaiting verification.", time: '15m ago', icon: UserPlus, link: '#' },
    { type: 'User Report', text: "User 'jane_doe' reported a product for inappropriate content.", time: '30m ago', icon: Shield, link: '#' },
    { type: 'Content Update', text: "The 'About Us' page has been updated and needs review.", time: '1h ago', icon: FileEdit, link: '#' },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(stats).map(([key, stat]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Sales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={sale.avatar} alt="Avatar" data-ai-hint="avatar" />
                          <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{sale.name}</p>
                          <p className="text-sm text-muted-foreground">{sale.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{sale.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Admin Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <CardDescription>Live feed of events needing your attention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {adminNotifications.map((notification, index) => (
                <div key={index} className="flex items-start gap-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
