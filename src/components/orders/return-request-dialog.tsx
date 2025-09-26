
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Order, OrderItem } from '@/lib/orders-service';
import type { ReturnReason, RmaItem } from '@/lib/returns-service';
import { createReturnRequest } from '@/lib/returns-service';
import { useToast } from '@/hooks/use-toast';

interface ReturnRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const RETURN_REASONS: ReturnReason[] = ['Damaged Item', 'Wrong Item', 'Not as Described', 'Customization Issue', 'Other'];

export function ReturnRequestDialog({ isOpen, onClose, order }: ReturnRequestDialogProps) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [reason, setReason] = React.useState<ReturnReason | ''>('');
  const [comments, setComments] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  const handleItemSelect = (itemId: string, isChecked: boolean) => {
    setSelectedItems(prev => 
        isChecked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  };
  
  const handleSubmit = async () => {
      if (selectedItems.length === 0) {
          toast({ title: "No items selected", description: "Please select at least one item to return.", variant: "destructive" });
          return;
      }
      if (!reason) {
          toast({ title: "Reason required", description: "Please select a reason for your return.", variant: "destructive" });
          return;
      }

      setIsSubmitting(true);
      
      const itemsToReturn: RmaItem[] = order.items
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            image: item.image,
        }));
      
      try {
          await createReturnRequest({
              orderId: order.id,
              orderReadableId: order.orderId,
              customerId: order.customer.id,
              items: itemsToReturn,
              reason: reason,
              customerComments: comments,
          });
          toast({ title: "Return Request Submitted", description: "Our team will review your request and get back to you shortly."});
          onClose();
          // Reset form state after a short delay
          setTimeout(() => {
              setSelectedItems([]);
              setReason('');
              setComments('');
          }, 300);

      } catch (error) {
          console.error("Failed to create return request", error);
          toast({ title: "Submission Failed", description: "Could not submit your return request. Please try again.", variant: "destructive" });
      } finally {
          setIsSubmitting(false);
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a Return for Order #{order.orderId}</DialogTitle>
          <DialogDescription>Select the items you wish to return and provide a reason.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className="space-y-4">
                <Label>Select Items</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-start gap-3 p-2 border rounded-md">
                           <Checkbox 
                                id={`return-${item.id}`} 
                                className="mt-1"
                                onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                                checked={selectedItems.includes(item.id)}
                           />
                           <Label htmlFor={`return-${item.id}`} className="flex-grow flex items-center gap-3 cursor-pointer">
                             <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-md" />
                             <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                             </div>
                           </Label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="return-reason">Reason for Return</Label>
                <Select value={reason} onValueChange={(value) => setReason(value as ReturnReason)}>
                    <SelectTrigger id="return-reason">
                        <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                        {RETURN_REASONS.map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="return-comments">Comments (Optional)</Label>
                <Textarea 
                    id="return-comments" 
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide more details about the issue..." 
                    rows={3}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
