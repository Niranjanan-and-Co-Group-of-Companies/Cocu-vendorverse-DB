
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
  const [countdown, setCountdown] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startCountdown = () => {
    setCountdown(30);
    if(timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  React.useEffect(() => {
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);
  
  const handleSendOtp = async (isInitial = false) => {
    if (!contactInfo) return;
    const phone = contactInfo.replace(/\D/g, '').slice(-10);
    setIsVerifying(true);
    const result = await sendOtp(phone);
    setIsVerifying(false);
    if (result.success) {
      startCountdown();
      if(!isInitial) toast({ title: 'New OTP Sent', description: 'A new verification code has been sent.' });
    } else {
      toast({ title: 'Failed to send OTP', description: result.message, variant: 'destructive'});
      if (isInitial) onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen && contactInfo) {
        handleSendOtp(true);
    } else {
        setOtp('');
        if (timerRef.current) clearInterval(timerRef.current);
        setCountdown(0);
    }
  }, [isOpen, contactInfo]);


  const handleVerify = async () => {
    const phone = contactInfo.replace(/\D/g, '').slice(-10);
    setIsVerifying(true);
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
            <div className="text-center text-sm text-muted-foreground">
                {countdown > 0 ? (
                    `Resend code in ${countdown}s`
                ) : (
                    <Button type="button" variant="link" size="sm" onClick={() => handleSendOtp()} disabled={isVerifying}>
                        Resend OTP
                    </Button>
                )}
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
