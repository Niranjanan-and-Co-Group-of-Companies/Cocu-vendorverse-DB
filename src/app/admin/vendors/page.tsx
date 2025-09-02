
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddVendorDialog } from '@/components/admin/vendors/add-vendor-dialog';
import { VendorActions } from '@/components/admin/vendors/vendor-actions';

// This will eventually come from Firestore
export interface Vendor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate: string;
}

const MOCK_VENDORS: Vendor[] = [
  { id: '1', name: 'Gourmet Delights', email: 'contact@gourmetdelights.com', avatar: 'https://picsum.photos/seed/1/40/40', status: 'Active', joinedDate: '2023-10-26' },
  { id: '2', name: 'Serene Moments', email: 'support@serenemoments.co', avatar: 'https://picsum.photos/seed/2/40/40', status: 'Active', joinedDate: '2023-09-15' },
  { id: '3', name: 'Heritage Wares', email: 'sales@heritagewares.com', avatar: 'https://picsum.photos/seed/3/40/40', status: 'Pending', joinedDate: '2023-11-01' },
  { id: '4', name: 'The Daily Grind', email: 'orders@dailygrind.coffee', avatar: 'https://picsum.photos/seed/4/40/40', status: 'Suspended', joinedDate: '2023-08-05' },
  { id: '5', name: 'Creative Crafts', email: 'info@creativecrafts.net', avatar: 'https://picsum.photos/seed/5/40/40', status: 'Active', joinedDate: '2023-10-30' },
];


export default function VendorsPage() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddVendorOpen, setIsAddVendorOpen] = React.useState(false);

  React.useEffect(() => {
    // Simulate fetching data from Firestore
    setTimeout(() => {
      setVendors(MOCK_VENDORS);
      setLoading(false);
    }, 1000);
  }, []);

  const handleVendorAdded = (newVendor: Omit<Vendor, 'id' | 'avatar' | 'status' | 'joinedDate'>) => {
    const vendor: Vendor = {
        ...newVendor,
        id: (vendors.length + 1).toString(),
        avatar: `https://picsum.photos/seed/${vendors.length + 1}/40/40`,
        status: 'Pending',
        joinedDate: new Date().toISOString().split('T')[0],
    };
    setVendors(prev => [vendor, ...prev]);
  };
  
  const handleVendorStatusChange = (vendorId: string, status: 'Active' | 'Pending' | 'Suspended') => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status } : v));
  }

  const getStatusVariant = (status: Vendor['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Suspended':
        return 'destructive';
      case 'Pending':
        return 'secondary';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">Manage Vendors</h1>
            <p className="text-muted-foreground">
            Here you can view, edit, and manage all vendors.
            </p>
        </div>
        <AddVendorDialog
            open={isAddVendorOpen}
            onOpenChange={setIsAddVendorOpen}
            onVendorAdded={handleVendorAdded}
        >
            <Button onClick={() => setIsAddVendorOpen(true)}>
                <PlusCircle className="mr-2" />
                Add Vendor
            </Button>
        </AddVendorDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={vendor.avatar} alt={vendor.name} data-ai-hint="avatar" />
                          <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {vendor.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(vendor.joinedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                       <VendorActions vendor={vendor} onStatusChange={handleVendorStatusChange} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// We need to import Card and CardContent to use them.
// Let's assume they are in our component library.
const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm" {...props}>
        {children}
    </div>
);

const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className="p-6" {...props}>
        {children}
    </div>
);
