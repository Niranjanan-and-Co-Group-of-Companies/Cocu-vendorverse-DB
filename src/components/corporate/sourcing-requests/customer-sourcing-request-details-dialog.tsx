
'use client';

import * as React from 'react';
import type { SourcingRequest } from '@/lib/sourcing-requests-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, Phone, User, Paperclip } from 'lucide-react';

interface CustomerSourcingRequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: SourcingRequest | null;
}

export function CustomerSourcingRequestDetailsDialog({ open, onOpenChange, request }: CustomerSourcingRequestDetailsDialogProps) {
  if (!request) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'New': return 'destructive';
      case 'In Progress': return 'default';
      case 'Sourced': return 'secondary';
      case 'Closed': return 'outline';
      default: return 'outline';
    }
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Request Details: #{request.id.slice(0,8)}...</span>
            <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted on: {request.createdAt?.toDate().toLocaleDateString() || 'N/A'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Left Column */}
            <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold text-sm">Product Description</h4>
                    <p className="text-muted-foreground">{request.productDescription}</p>
                 </div>
                 <div>
                    <h4 className="font-semibold text-sm">Additional Notes</h4>
                    <p className="text-muted-foreground">{request.notes || 'N/A'}</p>
                 </div>
                 {request.attachments && request.attachments.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-sm">Your Attachments</h4>
                        <div className="flex flex-col gap-2 mt-2">
                        {request.attachments.map((file, i) => (
                            <a href={file.url} key={i} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="w-full justify-start">
                                    <Paperclip className="mr-2" /> {file.name}
                                </Button>
                            </a>
                        ))}
                        </div>
                     </div>
                 )}
            </div>
            {/* Right Column */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm">Quantity</h4>
                        <p className="text-muted-foreground">{request.quantity}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm">Budget / Item</h4>
                        <p className="text-muted-foreground">{formatCurrency(request.budget)}</p>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <h4 className="font-semibold text-sm">Required By</h4>
                        <p className="text-muted-foreground">{request.requiredBy?.toDate().toLocaleDateString() || 'N/A'}</p>
                    </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-semibold text-sm">Contact Person</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{request.contactName}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{request.contactPhone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
