

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
import type { Vendor, VendorType } from '@/lib/vendors-service';


export default function VendorsPage() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);
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
  
  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsAddUserOpen(true);
  };
  
  const handleUserStatusChange = async (vendorId: string, status: 'Active' | 'Pending' | 'Suspended') => {
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
  
  const getTypeVariant = (type?: VendorType): 'default' | 'secondary' | 'outline' => {
      switch(type) {
          case 'both': return 'default';
          case 'corporate': return 'secondary';
          case 'personalized': return 'outline';
          default: return 'outline';
      }
  }

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
            open={isAddUserOpen}
            onOpenChange={setIsAddUserOpen}
            vendor={editingVendor}
        >
            <Button onClick={() => { setEditingVendor(null); setIsAddUserOpen(true); }}>
                <PlusCircle className="mr-2" />
                Add Vendor
            </Button>
        </AddVendorDialog>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
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
                    <TableCell>{vendor.phone}</TableCell>
                    <TableCell>
                        <Badge variant={getTypeVariant(vendor.type)} className="capitalize">{vendor.type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <VendorActions vendor={vendor} onStatusChange={handleUserStatusChange} onEdit={handleEdit} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
