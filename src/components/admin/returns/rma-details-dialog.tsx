
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import type { RmaLog, RmaStatus } from '@/lib/returns-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { updateRmaStatus } from '@/lib/admin/returns-service';
import { Check, Loader2, X } from 'lucide-react';
import Link from 'next/link';

interface RmaDetailsDialogProps {
  rma: RmaLog | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RmaDetailsDialog({ rma, isOpen, onOpenChange }: RmaDetailsDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  if (!rma) return null;

  const handleStatusChange = async (newStatus: RmaStatus) => {
    setIsSaving(true);
    try {
      await updateRmaStatus(rma.id!, newStatus);
      toast({
        title: `Request ${newStatus}`,
        description: `The return request has been marked as ${newStatus}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update request status.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Return Request Details</DialogTitle>
          <DialogDescription>
            RMA ID: <span className="font-mono">{rma.rmaId}</span> for Order <Link href={`/account/orders/${rma.orderId}`} className="underline font-mono">{rma.orderReadableId}</Link>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Items to Return</h4>
            <div className="space-y-3">
              {rma.items.map(item => (
                <div key={item.productId} className="flex items-center gap-3">
                  <Image src={item.image} alt={item.productName} width={48} height={48} className="rounded-md" />
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Reason</h4>
              <p>{rma.reason}</p>
            </div>
            <div>
              <h4 className="font-semibold">Customer Comments</h4>
              <p className="text-muted-foreground italic">"{rma.customerComments || 'No comments provided.'}"</p>
            </div>
          </div>
        </div>
        {rma.status === 'Pending Approval' && (
          <DialogFooter>
            <Button variant="destructive" onClick={() => handleStatusChange('Rejected')} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <X className="mr-2"/>}
                Reject
            </Button>
            <Button onClick={() => handleStatusChange('Approved')} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Check className="mr-2"/>}
                Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
