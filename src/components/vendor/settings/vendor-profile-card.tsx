
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Vendor } from '@/lib/vendors-service';
import { useToast } from '@/hooks/use-toast';
import { updateVendorSettings } from '@/lib/vendors-service';

interface VendorProfileCardProps {
  vendor: Vendor;
}

export function VendorProfileCard({ vendor }: VendorProfileCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateVendorSettings(vendor.id, { name: formData.name, phone: formData.phone });
      toast({ title: 'Profile Updated', description: 'Your profile information has been saved.' });
      setIsEditing(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Profile</CardTitle>
        <CardDescription>Manage your store name and contact information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="store-name">Store Name</Label>
          <Input id="store-name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} readOnly={!isEditing} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} readOnly disabled />
            <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} readOnly={!isEditing} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </CardFooter>
    </Card>
  );
}
