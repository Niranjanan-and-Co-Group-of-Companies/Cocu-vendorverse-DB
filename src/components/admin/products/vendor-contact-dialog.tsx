
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Vendor } from '@/lib/vendors-service';
import { Mail, Phone, MessageSquare } from 'lucide-react';

interface VendorContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export function VendorContactDialog({ open, onOpenChange, vendor }: VendorContactDialogProps) {
  
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Vendor</DialogTitle>
          <DialogDescription>
            Reach out to {vendor.name} regarding their product submission.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={vendor.avatar} alt={vendor.name} />
                    <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-semibold">{vendor.name}</h3>
                    <p className="text-sm text-muted-foreground">{vendor.email}</p>
                </div>
            </div>
            <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                    <Mail className="mr-2" /> Send Email
                </Button>
                 <Button variant="outline" className="w-full justify-start">
                    <Phone className="mr-2" /> Call Vendor
                </Button>
                 <Button variant="outline" className="w-full justify-start" disabled>
                    <MessageSquare className="mr-2" /> Send Platform Message (Disabled)
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
