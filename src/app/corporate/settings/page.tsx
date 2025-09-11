
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCorporateAccount } from '@/hooks/use-corporate-account-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle } from 'lucide-react';
import { updateCorporateClient } from '@/lib/corporate-clients-service';

function CompanyProfileCard() {
    const { account, updateClientProfile } = useCorporateAccount();
    const [name, setName] = React.useState('');
    const [contactPerson, setContactPerson] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (account) {
            setName(account.name);
            setContactPerson(account.contactPerson);
            setEmail(account.email);
            setPhone(account.phone);
        }
    }, [account]);

    const handleSave = async () => {
        setIsSaving(true);
        await updateClientProfile({ name, contactPerson, email, phone });
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Manage your company's primary contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} readOnly={!isEditing} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} readOnly={!isEditing} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Contact Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} readOnly={!isEditing} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} readOnly={!isEditing} />
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                {isEditing ? (
                    <>
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 animate-spin" />}
                            Save
                        </Button>
                    </>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
            </CardFooter>
        </Card>
    );
}

function GstDetailsCard() {
    const { account, updateGstProfile } = useCorporateAccount();
    const [gstin, setGstin] = React.useState('');
    const [legalName, setLegalName] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    
    // Admin action simulation
    const handleAdminVerify = async () => {
        if (!account) return;
        await updateCorporateClient(account.id, { gstStatus: 'Verified' });
    }

    const isVerified = account?.gstStatus === 'Verified';

    React.useEffect(() => {
        if (account?.gstProfile) {
            setGstin(account.gstProfile.gstin);
            setLegalName(account.gstProfile.legalName);
        }
    }, [account]);

    const handleSave = async () => {
        setIsSaving(true);
        await updateGstProfile(gstin, legalName);
        setIsSaving(false);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>GST Details</CardTitle>
                <CardDescription>Provide your GSTIN for proper invoicing. This is required for claiming input tax credit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN</Label>
                        <Input id="gstin" value={gstin} onChange={e => setGstin(e.target.value)} readOnly={isVerified} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="legalName">Company Legal Name</Label>
                        <Input id="legalName" value={legalName} onChange={e => setLegalName(e.target.value)} readOnly={isVerified} />
                    </div>
                </div>
                 {account?.gstStatus && (
                    <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={account.gstStatus === 'Verified' ? 'default' : 'secondary'}>
                                {account.gstStatus}
                            </Badge>
                             {account.gstStatus === 'Pending' && <p className="text-sm text-muted-foreground">Verification may take up to 24 hours.</p>}
                        </div>
                    </div>
                 )}
            </CardContent>
            {!isVerified && (
                 <CardFooter className="justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                        Save GST Details
                    </Button>
                </CardFooter>
            )}
             {account?.gstStatus === 'Pending' && (
                <CardFooter>
                    <Button variant="link" onClick={handleAdminVerify}><CheckCircle className="mr-2"/>(Admin) Force Verify</Button>
                </CardFooter>
            )}
        </Card>
    );
}


export default function CorporateSettingsPage() {
  const { account, isLoading } = useCorporateAccount();

  if(isLoading) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <CompanyProfileCard />
      <GstDetailsCard />
    </div>
  );
}
