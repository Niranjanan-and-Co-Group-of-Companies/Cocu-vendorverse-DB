
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Vendor } from '@/lib/vendors-service';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorAdded?: (vendor: Omit<Vendor, 'id' | 'avatar' | 'status' | 'joinedDate'>) => void;
  children: React.ReactNode;
  vendor?: Vendor | null; // Make vendor optional for add mode
}

export function AddVendorDialog({ open, onOpenChange, vendor, children }: AddVendorDialogProps) {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
    });
    const [isSaving, setIsSaving] = React.useState(false);
    const { toast } = useToast();
    const isEditMode = !!vendor;

    React.useEffect(() => {
        if (isEditMode && vendor) {
            setFormData({
                name: vendor.name,
                email: vendor.email,
                phone: vendor.phone,
                street: vendor.address?.street || '',
                city: vendor.address?.city || '',
                state: vendor.address?.state || '',
                pincode: vendor.address?.pincode || '',
                country: vendor.address?.country || 'India',
            });
        } else {
             setFormData({
                name: '', email: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India'
            });
        }
    }, [vendor, isEditMode, open]);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const dataToSave = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                country: formData.country,
            }
        };

        try {
            if (isEditMode && vendor) {
                const vendorRef = doc(db, 'vendors', vendor.id);
                await updateDoc(vendorRef, dataToSave);
                toast({ title: 'Vendor Updated', description: `${formData.name}'s details have been updated.` });
            } else {
                await addDoc(collection(db, 'vendors'), {
                    ...dataToSave,
                    avatar: `https://i.pravatar.cc/40?u=${Math.random()}`,
                    status: 'Pending',
                    joinedDate: serverTimestamp(),
                });
                toast({ title: 'Vendor Added', description: `${formData.name} has been added and is pending verification.` });
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save vendor:', error);
            toast({ title: 'Error', description: `Could not save vendor details.`, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Update details for ${vendor.name}.` : 'Enter the details for the new vendor.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" value={formData.street} onChange={(e) => handleInputChange('street', e.target.value)} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input id="pincode" value={formData.pincode} onChange={(e) => handleInputChange('pincode', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} />
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Vendor')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
