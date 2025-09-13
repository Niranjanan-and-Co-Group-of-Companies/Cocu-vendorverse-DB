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
import { sendOtp, verifyOtp } from '@/lib/otp-service';

interface OtpVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => Promise<void>;
  contactInfo: string;
}

export function OtpVerificationDialog({ isOpen, onClose, onVerified, contactInfo }: OtpVerificationDialogProps) {
  const [otp, setOtp] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen && contactInfo) {
        const sendUserOtp = async () => {
            const phone = contactInfo.replace(/\D/g, '').slice(-10); // Extract 10-digit phone
            const result = await sendOtp(phone);
            if (!result.success) {
                toast({ title: 'Failed to send OTP', description: result.message, variant: 'destructive'});
            } else {
                 toast({ title: 'OTP Sent', description: 'A code has been sent to your new phone number.' });
            }
        };
        sendUserOtp();
    }
  }, [isOpen, contactInfo, toast]);


  const handleVerify = async () => {
    setIsVerifying(true);
    const phone = contactInfo.replace(/\D/g, '').slice(-10);
    const result = await verifyOtp(phone, otp);

    if (result.success) {
        try {
            await onVerified();
            toast({ title: 'Success', description: 'Your contact information has been updated.' });
            onClose();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update information.', variant: 'destructive' });
        }
    } else {
         toast({ title: 'Invalid OTP', description: result.message, variant: 'destructive' });
    }

    setIsVerifying(false);
  };

  React.useEffect(() => {
    if (!isOpen) {
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
          <DialogTitle className="text-center">Confirm Your Change</DialogTitle>
          <DialogDescription className="text-center">
            We've sent a 6-digit code to {contactInfo}. Please enter it below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="otp-verification">Verification Code</Label>
            <Input
              id="otp-verification"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              autoComplete="one-time-code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button type="button" onClick={handleVerify} disabled={isVerifying || otp.length < 6}>
            {isVerifying && <Loader2 className="mr-2 animate-spin" />}
            Verify & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}