
'use client';

import * as React from 'react';
import type { SourcingRequest } from '@/app/admin/sourcing-requests/page';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SourcingRequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: SourcingRequest | null;
  onStatusChange: (id: string, status: SourcingRequest['status']) => void;
}

export function SourcingRequestDetailsDialog({ open, onOpenChange, request, onStatusChange }: SourcingRequestDetailsDialogProps) {
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
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Sourcing Request: {request.id}</span>
            <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            From: {request.customer.name} ({request.customer.contact})
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Left Column */}
            <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold text-sm">Product Description</h4>
                    <p className="text-muted-foreground">{request.product}</p>
                 </div>
                 <div>
                    <h4 className="font-semibold text-sm">Additional Notes</h4>
                    <p className="text-muted-foreground">{request.notes || 'N/A'}</p>
                 </div>
                 {request.attachments.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-sm">Attachments</h4>
                        <div className="flex flex-col gap-2 mt-2">
                        {request.attachments.map((file, i) => (
                            <a href={file.url} key={i} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="mr-2" /> {file.name}
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
                        <p className="text-muted-foreground">{formatCurrency(request.budgetPerItem)}</p>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm">Date Requested</h4>
                        <p className="text-muted-foreground">{request.date}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm">Required By</h4>
                        <p className="text-muted-foreground">{request.requiredBy}</p>
                    </div>
                </div>
                 <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Update Status</h4>
                    <Select value={request.status} onValueChange={(value) => onStatusChange(request.id, value as SourcingRequest['status'])}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Sourced">Sourced</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button className="w-full">
                    <Mail className="mr-2"/> Contact Customer
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
