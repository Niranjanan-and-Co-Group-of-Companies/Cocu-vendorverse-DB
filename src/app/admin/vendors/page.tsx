
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
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate: any; // Keep as any to handle Firestore Timestamps
}

export default function VendorsPage() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddVendorOpen, setIsAddVendorOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      const vendorsData: Vendor[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vendor));
      setVendors(vendorsData);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsub();
  }, []);

  const handleVendorAdded = async (newVendor: Omit<Vendor, 'id' | 'avatar' | 'status' | 'joinedDate'>) => {
    try {
      await addDoc(collection(db, 'vendors'), {
        ...newVendor,
        avatar: `https://picsum.photos/seed/${Math.random()}/40/40`,
        status: 'Pending',
        joinedDate: serverTimestamp(),
      });
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error("Error adding vendor: ", error);
      toast({
        title: "Error",
        description: "Failed to add new vendor.",
        variant: "destructive",
      });
    }
  };
  
  const handleVendorStatusChange = async (vendorId: string, status: 'Active' | 'Pending' | 'Suspended') => {
     try {
      const vendorRef = doc(db, 'vendors', vendorId);
      await updateDoc(vendorRef, { status });
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
       console.error("Error updating vendor status: ", error);
       toast({
        title: "Error",
        description: "Failed to update vendor status.",
        variant: "destructive",
      });
    }
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
  
  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    return 'N/A';
  }

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
                      {formatDate(vendor.joinedDate)}
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
    <div className="p-6 pt-0" {...props}>
        {children}
    </div>
);
