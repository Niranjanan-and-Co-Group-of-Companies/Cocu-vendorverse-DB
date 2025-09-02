
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
import type { Vendor } from '@/app/admin/vendors/page';

interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorAdded: (vendor: Omit<Vendor, 'id' | 'avatar' | 'status' | 'joinedDate'>) => void;
  children: React.ReactNode;
}

export function AddVendorDialog({ open, onOpenChange, onVendorAdded, children }: AddVendorDialogProps) {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const { toast } = useToast();

  const handleContinue = () => {
    if (!name || !email) {
        toast({
            title: "Validation Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
        });
        return;
    }
    // In a real app, you would send an OTP here.
    // For now, we just simulate it.
    setStep(2);
    toast({
        title: "OTP Sent",
        description: "A one-time password has been sent to the provided phone number.",
    });
  };

  const handleAddVendor = () => {
    // In a real app, you'd verify the OTP.
    if (otp !== '123456') {
        toast({
            title: "Invalid OTP",
            description: "The OTP you entered is incorrect.",
            variant: "destructive",
        });
        return;
    }
    
    onVendorAdded({ name, email });
    toast({
        title: "Vendor Added",
        description: `${name} has been successfully added and is pending verification.`,
    });
    
    // Reset state and close dialog
    onOpenChange(false);
    setTimeout(() => {
        setStep(1);
        setName('');
        setEmail('');
        setPhone('');
        setOtp('');
    }, 200); // Delay reset to allow dialog to close smoothly
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
         setTimeout(() => {
            setStep(1);
            setName('');
            setEmail('');
            setPhone('');
            setOtp('');
        }, 200);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
        {children}
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Enter the details for the new vendor. They will receive an invitation to set up their storefront.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Vendor's Store Name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="contact@vendor.com" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" placeholder="+1 (555) 555-5555" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleContinue}>Continue</Button>
            </DialogFooter>
          </>
        )}
        {step === 2 && (
             <>
                <DialogHeader>
                    <DialogTitle>Verify Contact</DialogTitle>
                    <DialogDescription>
                        Enter the 6-digit OTP sent to the vendor's phone to complete setup. (Hint: it's 123456)
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="otp" className="text-right">
                        OTP
                        </Label>
                        <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="col-span-3" placeholder="123456" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={handleAddVendor}>Add Vendor</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
