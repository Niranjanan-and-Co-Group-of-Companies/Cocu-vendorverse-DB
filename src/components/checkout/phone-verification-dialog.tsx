
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

interface PhoneVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

export function PhoneVerificationDialog({ isOpen, onOpenChange, onVerified }: PhoneVerificationDialogProps) {
  const [step, setStep] = React.useState(1);
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();

  const handleSendOtp = () => {
    if (phone.length < 10) {
      toast({ title: "Invalid Phone Number", variant: "destructive" });
      return;
    }
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setStep(2);
      toast({ title: "OTP Sent", description: "A one-time password has been sent." });
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') { // Mock OTP
      toast({ title: "Phone Verified", description: "You can now proceed with your order." });
      onVerified();
    } else {
      toast({ title: "Invalid OTP", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Verify Your Phone Number</DialogTitle>
          <DialogDescription className="text-center">
            {step === 1 
              ? "For security, we need to verify your phone number before you can place an order."
              : "Enter the 6-digit code we sent to your phone. (Hint: 123456)"
            }
          </DialogDescription>
        </DialogHeader>
        {step === 1 ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <Button onClick={handleSendOtp} disabled={isSending}>
              {isSending && <Loader2 className="mr-2 animate-spin" />}
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
            </div>
             <Button onClick={handleVerifyOtp}>Verify & Continue</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
