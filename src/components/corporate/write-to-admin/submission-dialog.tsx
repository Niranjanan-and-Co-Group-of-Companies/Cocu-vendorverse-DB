
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import type { SourcingRequestData } from '@/app/corporate/write-to-admin/page';
import { createSourcingRequest } from '@/lib/sourcing-requests-service';

interface SubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: SourcingRequestData | null;
  onVerified: () => void;
}

export function SubmissionDialog({ isOpen, onClose, requestData, onVerified }: SubmissionDialogProps) {
  const [otp, setOtp] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!requestData) return;
    
    if (otp !== '123456') { // Mock OTP check
        toast({ title: "Invalid OTP", description: "The OTP you entered is incorrect.", variant: "destructive" });
        return;
    }

    setIsVerifying(true);
    try {
        await createSourcingRequest(requestData);
        onVerified();
    } catch (error) {
        console.error("Failed to create sourcing request:", error);
        toast({ title: "Error", description: "Could not submit your request. Please try again.", variant: "destructive" });
    } finally {
        setIsVerifying(false);
    }
  };
  
  React.useEffect(() => {
    setOtp('');
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Verify Your Phone Number</DialogTitle>
          <DialogDescription className="text-center">
            To finalize your request, please enter the 6-digit code we sent to {requestData?.contactPhone}. (Hint: use 123456)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input 
                id="otp" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="123456" 
                autoComplete="one-time-code"
              />
            </div>
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isVerifying}>Cancel</Button>
            <Button type="button" onClick={handleVerify} disabled={isVerifying || otp.length < 6}>
                {isVerifying && <Loader2 className="mr-2 animate-spin" />}
                Verify & Submit Request
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
