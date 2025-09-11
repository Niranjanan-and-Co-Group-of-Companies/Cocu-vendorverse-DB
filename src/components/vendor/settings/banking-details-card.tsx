
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

interface BankingDetailsCardProps {
  vendor: Vendor;
}

export function BankingDetailsCard({ vendor }: BankingDetailsCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    beneficiary: vendor.banking.beneficiary || '',
    ifsc: vendor.banking.ifsc || '',
    accountNo: '', // Always start blank for security
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.beneficiary || !formData.ifsc || !formData.accountNo) {
        toast({ title: 'All fields are required', variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    try {
      const newBankingDetails = {
        beneficiary: formData.beneficiary,
        ifsc: formData.ifsc,
        // In a real app, this would be encrypted. We only store the masked version.
        accountNoMasked: `********${formData.accountNo.slice(-4)}`,
      };
      await updateVendorSettings(vendor.id, { banking: newBankingDetails });
      toast({ title: 'Banking Details Updated', description: 'Your payout information has been securely saved.' });
      setIsEditing(false);
      setFormData(prev => ({...prev, accountNo: ''})); // Clear sensitive field
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update banking details.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banking & Payouts</CardTitle>
        <CardDescription>Manage where your earnings are deposited.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="beneficiary">Beneficiary Name</Label>
          <Input id="beneficiary" value={formData.beneficiary} onChange={e => handleInputChange('beneficiary', e.target.value)} readOnly={!isEditing} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ifsc">IFSC Code</Label>
            <Input id="ifsc" value={formData.ifsc} onChange={e => handleInputChange('ifsc', e.target.value)} readOnly={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-no">Account Number</Label>
            {isEditing ? (
              <Input id="account-no" type="password" value={formData.accountNo} onChange={e => handleInputChange('accountNo', e.target.value)} placeholder="Enter new account number" />
            ) : (
              <Input id="account-no-masked" readOnly value={vendor.banking.accountNoMasked || 'Not Provided'} />
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">For security, your full account number is never displayed.</p>
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
          <Button onClick={() => setIsEditing(true)}>Update Banking Details</Button>
        )}
      </CardFooter>
    </Card>
  );
}
