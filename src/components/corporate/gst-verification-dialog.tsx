
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
import { FileText, Loader2 } from 'lucide-react';
import { useCorporateAccount } from '@/hooks/use-corporate-account-store';

export function GstVerificationDialog() {
  const { account, isLoading, updateGstProfile } = useCorporateAccount();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [gstin, setGstin] = React.useState('');
  const [legalName, setLegalName] = React.useState('');

  React.useEffect(() => {
    if (isLoading || account?.gstStatus === 'Verified' || account?.gstStatus === 'Pending') {
      return;
    }
    
    const hasSeenPrompt = sessionStorage.getItem('gstPromptSeen');
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // Wait 5 seconds before showing
      return () => clearTimeout(timer);
    }
  }, [account, isLoading]);

  const handleClose = () => {
    sessionStorage.setItem('gstPromptSeen', 'true');
    setIsOpen(false);
  };
  
  const handleSave = async () => {
    if (!gstin || !legalName) {
        alert('Both GSTIN and Legal Name are required.');
        return;
    }
    setIsSaving(true);
    await updateGstProfile(gstin, legalName);
    setIsSaving(false);
    handleClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Complete Your GST Verification</DialogTitle>
          <DialogDescription className="text-center">
            To ensure proper invoicing for your corporate purchases, please provide your company's GST details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="gstin-dialog">GSTIN Number</Label>
            <Input id="gstin-dialog" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="e.g., 29ABCDE1234F1Z5" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="company-name-dialog">Company Legal Name</Label>
            <Input id="company-name-dialog" value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="Your Company Pvt. Ltd." />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={handleClose}>Remind Me Later</Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 animate-spin" />}
                Save & Verify
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
