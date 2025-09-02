
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

export function GstVerificationDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    // Show dialog only if it hasn't been seen in this session
    const hasSeenPrompt = sessionStorage.getItem('gstPromptSeen');
    if (!hasSeenPrompt) {
      // Use a timeout to avoid layout shift issues on initial load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('gstPromptSeen', 'true');
    setIsOpen(false);
  };
  
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      handleClose();
    }, 1500)
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
            <Label htmlFor="gstin">GSTIN Number</Label>
            <Input id="gstin" placeholder="e.g., 29ABCDE1234F1Z5" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="company-name">Company Legal Name</Label>
            <Input id="company-name" placeholder="Your Company Inc." />
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
