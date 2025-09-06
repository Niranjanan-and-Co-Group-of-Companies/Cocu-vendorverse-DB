
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

interface OtpVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => Promise<void>;
  termsType: 'Customer' | 'Vendor' | null;
}

export function OtpVerificationDialog({ isOpen, onOpenChange, onVerified, termsType }: OtpVerificationDialogProps) {
  const [otp, setOtp] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (otp !== '123456') { // Mock OTP check
      toast({
        title: 'Invalid OTP',
        description: 'The one-time password you entered is incorrect.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
        await onVerified();
        onOpenChange(false); // Close dialog on success
    } catch(e) {
        // Error toast will be shown by the parent component
        console.error("Verification callback failed", e);
    } finally {
        setIsVerifying(false);
    }
  };
  
  React.useEffect(() => {
    if(!isOpen) {
        // Reset OTP when dialog is closed
        setOtp('');
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
            To update the {termsType} Terms, please enter the OTP sent to the admin's registered contact details. (Hint: it's 123456)
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isVerifying}>Cancel</Button>
            <Button type="button" onClick={handleVerify} disabled={isVerifying || otp.length < 6}>
                {isVerifying && <Loader2 className="mr-2 animate-spin" />}
                Verify & Update
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
