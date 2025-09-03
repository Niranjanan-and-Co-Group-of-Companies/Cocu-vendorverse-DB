
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VendorInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorName: string;
  vendorBio: string;
}

export function VendorInfoDialog({ open, onOpenChange, vendorName, vendorBio }: VendorInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{vendorName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{vendorBio || "No bio available for this vendor."}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
