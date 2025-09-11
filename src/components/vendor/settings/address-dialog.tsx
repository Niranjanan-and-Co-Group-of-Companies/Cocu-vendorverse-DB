
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { VendorAddress } from '@/lib/vendors-service';

interface AddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: VendorAddress) => void;
  address: VendorAddress | null;
}

export function AddressDialog({ isOpen, onClose, onSave, address }: AddressDialogProps) {
  const [formData, setFormData] = React.useState<Omit<VendorAddress, 'id'>>({
    label: '', street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false
  });

  React.useEffect(() => {
    if (address) {
      setFormData(address);
    } else {
      setFormData({ label: '', street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
    }
  }, [address, isOpen]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({ ...formData, id: address?.id || '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>Enter the details for your pickup location.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Address Label</Label>
            <Input id="label" value={formData.label} onChange={e => handleInputChange('label', e.target.value)} placeholder="e.g., Main Warehouse" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Street</Label>
            <Input id="street" value={formData.street} onChange={e => handleInputChange('street', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pincode">PIN Code</Label>
              <Input id="pincode" value={formData.pincode} onChange={e => handleInputChange('pincode', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={formData.country} onChange={e => handleInputChange('country', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is-default" checked={formData.isDefault} onCheckedChange={(checked) => handleInputChange('isDefault', checked)} />
            <Label htmlFor="is-default" className="font-normal">Set as default pickup address</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Address</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
