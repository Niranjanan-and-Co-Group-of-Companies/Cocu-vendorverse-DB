
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { sendOtp, verifyOtp } from '@/lib/otp-service';

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


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setPhone(numericValue);
  };

  const handleSendOtp = async (isResend = false) => {
    if (phone.length < 10) {
      toast({ title: "Invalid Phone Number", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    setIsSending(true);
    const result = await sendOtp(phone);
    setIsSending(false);

    if (result.success) {
      setStep(2);
      startCountdown();
      if (!isResend) {
        toast({ title: "OTP Sent", description: result.message });
      } else {
        toast({ title: "New OTP Sent", description: "A new verification code has been sent." });
      }
    } else {
      toast({ title: "Failed to Send OTP", description: result.message, variant: "destructive" });
    }
  };
  
  const handleResendOtp = async () => {
    await handleSendOtp(true);
  };


  const handleVerifyOtp = async () => {
    setIsSending(true);
    const result = await verifyOtp(phone, otp);
    setIsSending(false);

    if (result.success) {
      toast({ title: "Phone Verified", description: "You can now proceed with your order." });
      onVerified();
      onOpenChange(false);
    } else {
      toast({ title: "Verification Failed", description: result.message, variant: "destructive" });
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setStep(1);
            setPhone('');
            setOtp('');
            if (timerRef.current) clearInterval(timerRef.current);
            setCountdown(0);
        }, 200);
    }
  }, [isOpen]);

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
              : `Enter the 6-digit code we sent to +91 ${phone}.`
            }
          </DialogDescription>
        </DialogHeader>
        {step === 1 ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
               <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">+91</span>
                  <Input id="phone" type="tel" value={phone} onChange={handlePhoneChange} placeholder="98765 43210" className="pl-10" />
              </div>
            </div>
            <Button onClick={() => handleSendOtp()} disabled={isSending}>
              {isSending && <Loader2 className="mr-2 animate-spin" />}
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" />
            </div>
            <div className="text-center text-sm text-muted-foreground">
                {countdown > 0 ? (
                    `Resend code in ${countdown}s`
                ) : (
                    <Button type="button" variant="link" size="sm" onClick={handleResendOtp} disabled={isSending}>
                        Resend OTP
                    </Button>
                )}
            </div>
             <Button onClick={handleVerifyOtp} disabled={isSending}>
                {isSending && <Loader2 className="mr-2 animate-spin" />}
                Verify & Continue
             </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
