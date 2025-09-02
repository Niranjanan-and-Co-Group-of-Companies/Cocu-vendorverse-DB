
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createBid } from '@/lib/bids-service';
import type { Product } from '@/lib/products';
import type { BidDetails } from './bid-details-card';
import type { AdditionalInfo } from './additional-info-card';

interface SubmitBidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bidDetails: BidDetails;
  additionalInfo: AdditionalInfo;
  products: Product[];
  onBidFinalized: () => void;
}

export function SubmitBidDialog({ isOpen, onClose, bidDetails, additionalInfo, products, onBidFinalized }: SubmitBidDialogProps) {
  const [otp, setOtp] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const handleFinalizeBid = async () => {
    if (otp !== '123456') { // Mock OTP check
        toast({ title: 'Invalid OTP', description: 'The OTP you entered is incorrect.', variant: 'destructive' });
        return;
    }
    
    setIsSaving(true);
    try {
        await createBid({
            products: products.map(p => ({ id: p.id, name: p.name, image: p.image, vendor: p.vendor })),
            ...bidDetails,
            ...additionalInfo,
        });
        toast({ title: 'Bid Submitted!', description: 'Vendors will now be notified of your request.' });
        onBidFinalized();
    } catch (error) {
        console.error("Failed to create bid:", error);
        toast({ title: 'Error', description: 'Could not submit your bid request.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify & Submit Bid</DialogTitle>
          <DialogDescription>
            Enter the 6-digit OTP sent to your registered mobile number to confirm your bid request. (Hint: use 123456)
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid gap-2">
            <Label htmlFor="otp">One-Time Password</Label>
            <Input 
                id="otp" 
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleFinalizeBid} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
