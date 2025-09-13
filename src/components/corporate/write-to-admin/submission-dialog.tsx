
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
import type { SourcingRequestData } from '@/app/corporate/sourcing-requests/new/page';
import { createSourcingRequest } from '@/lib/sourcing-requests-service';
import { sendOtp, verifyOtp } from '@/lib/otp-service';

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

   React.useEffect(() => {
    if (isOpen && requestData?.contactPhone) {
        const phone = requestData.contactPhone.replace(/\D/g, '').slice(-10);
        sendOtp(phone).then(result => {
            if(result.success) {
                toast({ title: 'OTP Sent', description: 'A code has been sent to the contact phone number.' });
            } else {
                 toast({ title: 'Failed to Send OTP', description: result.message, variant: 'destructive' });
                 onClose();
            }
        })
    }
  }, [isOpen, requestData, toast, onClose]);


  const handleVerify = async () => {
    if (!requestData) return;
    const phone = requestData.contactPhone.replace(/\D/g, '').slice(-10);
    
    setIsVerifying(true);
    const otpResult = await verifyOtp(phone, otp);

    if (!otpResult.success) {
        toast({ title: "Invalid OTP", description: otpResult.message, variant: "destructive" });
        setIsVerifying(false);
        return;
    }

    try {
        await createSourcingRequest(requestData);
        onVerified();
    } catch (error) {
        console.error("Failed to create sourcing request:", error);
        toast({ title: "Error", description: "Could not submit your request. Please try again.", variant: "destructive" });
    } finally {
        setIsVerifying(false);
        onClose();
    }
  };
  
  React.useEffect(() => {
    if(!isOpen) {
        setOtp('');
    }
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
            To finalize your request, please enter the 6-digit code we sent to {requestData?.contactPhone}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input 
                id="otp" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Enter 6-digit OTP" 
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
