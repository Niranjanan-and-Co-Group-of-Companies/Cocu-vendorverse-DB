
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Vendor, VendorAddress } from '@/lib/vendors-service';
import { AddressDialog } from './address-dialog';
import { updateVendorSettings } from '@/lib/vendors-service';
import { useToast } from '@/hooks/use-toast';

interface PickupAddressCardProps {
  vendor: Vendor;
}

export function PickupAddressCard({ vendor }: PickupAddressCardProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<VendorAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<VendorAddress | null>(null);
  const { toast } = useToast();

  const handleEdit = (address: VendorAddress) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleDelete = (address: VendorAddress) => {
    if (vendor.pickupAddresses.length <= 1) {
      toast({
        title: 'Cannot Delete',
        description: 'You must have at least one pickup address.',
        variant: 'destructive',
      });
      return;
    }
    setAddressToDelete(address);
    setIsAlertOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!addressToDelete) return;
    const newAddresses = vendor.pickupAddresses.filter(addr => addr.id !== addressToDelete.id);
    if(addressToDelete.isDefault) {
        newAddresses[0].isDefault = true;
    }
    try {
        await updateVendorSettings(vendor.id, { pickupAddresses: newAddresses });
        toast({ title: 'Address Deleted' });
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete address.', variant: 'destructive' });
    }
    setIsAlertOpen(false);
  }

  const handleSave = async (address: VendorAddress) => {
    let newAddresses: VendorAddress[];
    if (address.id) { // Editing existing
      newAddresses = vendor.pickupAddresses.map(addr => addr.id === address.id ? address : addr);
    } else { // Adding new
      newAddresses = [...vendor.pickupAddresses, { ...address, id: `addr_${Date.now()}` }];
    }
    
    // Ensure only one default address
    if (address.isDefault) {
      newAddresses = newAddresses.map(addr => ({ ...addr, isDefault: addr.id === address.id }));
    }

    try {
        await updateVendorSettings(vendor.id, { pickupAddresses: newAddresses });
        toast({ title: 'Address Saved Successfully' });
        setIsDialogOpen(false);
    } catch(error) {
        toast({ title: 'Error', description: 'Failed to save address.', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Pickup Addresses</CardTitle>
                <CardDescription>Manage where your shipments will be picked up from.</CardDescription>
            </div>
             <Button variant="outline" size="sm" onClick={() => { setEditingAddress(null); setIsDialogOpen(true); }}>
                <PlusCircle className="mr-2" /> Add New
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
            {vendor.pickupAddresses.map(addr => (
                <div key={addr.id} className="flex items-start justify-between p-3 border rounded-md">
                    <div>
                        <p className="font-semibold">{addr.label} {addr.isDefault && <span className="text-xs font-normal text-muted-foreground">(Default)</span>}</p>
                        <address className="not-italic text-sm text-muted-foreground">
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </address>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(addr)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(addr)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                </div>
            ))}
            {vendor.pickupAddresses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No pickup addresses added yet.</p>
            )}
        </CardContent>
      </Card>
      
      <AddressDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        address={editingAddress}
      />
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action will permanently delete this address.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
