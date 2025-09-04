
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
import { addCorporateClient, updateCorporateClient, type CorporateClient } from '@/lib/corporate-clients-service';
import { Loader2 } from 'lucide-react';

interface AddClientDialogProps {
  client?: CorporateClient | null;
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function AddClientDialog({ client, children, onSuccess }: AddClientDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [contactPerson, setContactPerson] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();
  
  const isEditMode = !!client;

  React.useEffect(() => {
    if (client && open) {
      setName(client.name);
      setContactPerson(client.contactPerson);
      setEmail(client.email);
      setPhone(client.phone);
    } else {
        setName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
    }
  }, [client, open]);

  const handleSubmit = async () => {
    if (!name || !contactPerson || !email || !phone) {
      toast({ title: "All fields are required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      if (isEditMode && client) {
        await updateCorporateClient(client.id, { name, contactPerson, email, phone });
        toast({ title: "Client Updated", description: `${name} has been updated.` });
      } else {
        await addCorporateClient({ name, contactPerson, email, phone });
        toast({ title: "Client Added", description: `${name} has been added.` });
      }
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${isEditMode ? 'update' : 'add'} client.`, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
          {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Corporate Client' : 'Add New Corporate Client'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Update the details for ${client.name}.` : 'Enter the details for the new corporate account.'}
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Save Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
