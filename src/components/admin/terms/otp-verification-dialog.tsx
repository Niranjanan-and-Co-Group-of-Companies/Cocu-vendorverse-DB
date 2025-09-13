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
  onOpenChange: (open: boolean) => void;
  onVerified: () => Promise<void>;
  termsType: 'Customer' | 'Vendor' | null;
}

export function OtpVerificationDialog({ isOpen, onOpenChange, onVerified, termsType }: OtpVerificationDialogProps) {
  const [phoneOtp, setPhoneOtp] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const { toast } = useToast();
  
  // Admin phone number is hardcoded for this demo
  const adminPhone = '9999999999';

  React.useEffect(() => {
    if (isOpen) {
        // Automatically send OTP when dialog opens
        const sendAdminOtp = async () => {
            const result = await sendOtp(adminPhone);
            if (result.success) {
                toast({ title: 'OTP Sent', description: 'A code has been sent to the admin phone number.' });
            } else {
                 toast({ title: 'Failed to Send OTP', description: result.message, variant: 'destructive' });
                 onOpenChange(false);
            }
        };
        sendAdminOtp();
    }
  }, [isOpen, toast, onOpenChange]);

  const handleVerify = async () => {
    setIsVerifying(true);
    const result = await verifyOtp(adminPhone, phoneOtp);
    
    if (result.success) {
        try {
            await onVerified();
            onOpenChange(false); // Close dialog on success
        } catch(e) {
            // Error toast will be shown by the parent component
            console.error("Verification callback failed", e);
        }
    } else {
        toast({
            title: 'Invalid OTP',
            description: result.message,
            variant: 'destructive',
        });
    }

    setIsVerifying(false);
  };
  
  React.useEffect(() => {
    if(!isOpen) {
        setPhoneOtp('');
    }
  }, [isOpen]);

  if (!termsType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Admin Verification Required</DialogTitle>
          <DialogDescription className="text-center">
            To update the {termsType} Terms, please enter the OTP sent to the admin's registered phone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
             <div className="grid gap-2">
              <Label htmlFor="phone-otp">Phone OTP</Label>
              <Input 
                id="phone-otp" 
                value={phoneOtp} 
                onChange={(e) => setPhoneOtp(e.target.value)} 
                placeholder="Enter 6-digit OTP" 
                autoComplete="one-time-code"
              />
            </div>
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isVerifying}>Cancel</Button>
            <Button type="button" onClick={handleVerify} disabled={isVerifying || phoneOtp.length < 6}>
                {isVerifying && <Loader2 className="mr-2 animate-spin" />}
                Verify & Update
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}