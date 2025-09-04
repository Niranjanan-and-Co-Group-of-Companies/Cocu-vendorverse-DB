
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addCorporateClient, type CorporateClient } from '@/lib/corporate-clients-service';
import { Loader2 } from 'lucide-react';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AddClientDialog({ open, onOpenChange, children }: AddClientDialogProps) {
  const [name, setName] = React.useState('');
  const [contactPerson, setContactPerson] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name || !contactPerson || !email || !phone) {
      toast({ title: "All fields are required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await addCorporateClient({ name, contactPerson, email, phone });
      toast({ title: "Client Added", description: `${name} has been added.` });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add client.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    if (!open) {
        setName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Corporate Client</DialogTitle>
          <DialogDescription>
            Enter the details for the new corporate account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-person">Contact Person</Label>
            <Input id="contact-person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 animate-spin" />}
            Save Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
