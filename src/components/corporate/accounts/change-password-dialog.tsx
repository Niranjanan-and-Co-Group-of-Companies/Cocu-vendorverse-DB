
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
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Phone } from 'lucide-react';
import { sendOtp, verifyOtp } from '@/lib/otp-service';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [step, setStep] = React.useState(1);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [otpMethod, setOtpMethod] = React.useState<'email' | 'phone'>('email');
  const [otp, setOtp] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // In a real app, this would come from the user's profile
  const MOCK_PHONE = '9876543210'; 

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

  const handleContinue = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
        toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    const otpResult = await sendOtp(MOCK_PHONE);
    setIsSaving(false);
    if (otpResult.success) {
      setStep(2);
      startCountdown();
      toast({ title: "OTP Sent", description: `A verification code has been sent to your registered ${otpMethod}.` });
    } else {
      toast({ title: "Failed to send OTP", description: otpResult.message, variant: "destructive" });
    }
  }

  const handleSubmit = async () => {
    setIsSaving(true);
    const verificationResult = await verifyOtp(MOCK_PHONE, otp);
    if (!verificationResult.success) {
        toast({ title: 'Invalid OTP', description: 'The code you entered is incorrect.', variant: 'destructive' });
        setIsSaving(false);
        return;
    }
    
    // Simulate API call to change password
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
    setIsSaving(false);
    onOpenChange(false);
  };

  React.useEffect(() => {
    // Reset state when dialog is closed or opened
    if (!open) {
        setTimeout(() => {
            setStep(1);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setOtp('');
            setCountdown(0);
            if(timerRef.current) clearInterval(timerRef.current);
        }, 200);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
           <DialogDescription>
            {step === 1 ? 'Enter your current and new password.' : 'Enter the verification code sent to your device.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
           <div className="space-y-2">
            <Label>Send Verification Code via</Label>
             <RadioGroup defaultValue="email" value={otpMethod} onValueChange={(value) => setOtpMethod(value as any)} className="grid grid-cols-2 gap-4">
                <div>
                    <RadioGroupItem value="email" id="email-radio" className="peer sr-only" />
                    <Label htmlFor="email-radio" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <Mail className="mr-2 h-4 w-4" /> Email
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="phone" id="phone-radio" className="peer sr-only" />
                    <Label htmlFor="phone-radio" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <Phone className="mr-2 h-4 w-4" /> Phone
                    </Label>
                </div>
            </RadioGroup>
           </div>
        </div>
        ) : (
        <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input 
                    id="otp" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="123456" 
                    autoComplete="one-time-code"
                />
            </div>
             <div className="text-center text-sm text-muted-foreground">
                {countdown > 0 ? (
                    `Resend code in ${countdown}s`
                ) : (
                    <Button type="button" variant="link" size="sm" onClick={handleContinue} disabled={isSaving}>
                        Resend OTP
                    </Button>
                )}
            </div>
        </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {step === 1 ? (
            <Button onClick={handleContinue} disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}>
                 {isSaving && <Loader2 className="mr-2 animate-spin" />}
                Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSaving || otp.length < 6}>
                {isSaving && <Loader2 className="mr-2 animate-spin" />}
                Verify & Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
