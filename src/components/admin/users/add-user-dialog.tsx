
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
import type { User, UserRole } from '@/lib/user-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendOtp, verifyOtp } from '@/lib/otp-service';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: (user: Omit<User, 'id' | 'avatar' | 'status' | 'joinedDate' | 'communicationPrefs'>) => void;
  children: React.ReactNode;
}

export function AddUserDialog({ open, onOpenChange, onUserAdded, children }: AddUserDialogProps) {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('customer');
  const [otp, setOtp] = React.useState('');
  const { toast } = useToast();

  const handleContinue = async () => {
    if (!name || !email || !phone) {
        toast({
            title: "Validation Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
        });
        return;
    }
    
    const result = await sendOtp(phone);
    if (result.success) {
        setStep(2);
        toast({
            title: "OTP Sent",
            description: "A one-time password has been sent to the customer's phone number.",
        });
    } else {
        toast({
            title: "Failed to send OTP",
            description: result.message,
            variant: "destructive",
        });
    }
  };

  const handleAddUser = async () => {
    const result = await verifyOtp(phone, otp);
    if (!result.success) {
        toast({
            title: "Invalid OTP",
            description: result.message,
            variant: "destructive",
        });
        return;
    }
    
    onUserAdded({ name, email, role, phone: `+91${phone}` });
    toast({
        title: "Customer Added",
        description: `Customer account for ${name} has been successfully created.`,
    });
    
    onOpenChange(false);
    setTimeout(() => {
        setStep(1);
        setName('');
        setEmail('');
        setPhone('');
        setOtp('');
    }, 200);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setPhone(numericValue);
  };


  return (
    <Dialog open={open} onOpenChange={handleClose}>
        {children}
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the details for the new customer. They will receive an invitation to set up their account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="john.d@example.com" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                 <div className="relative col-span-3">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">+91</span>
                    <Input id="phone" type="tel" value={phone} onChange={handlePhoneChange} className="pl-10" placeholder="98765 43210" />
                </div>
              </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                        Role
                    </Label>
                    <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                        <SelectTrigger id="role" className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                             <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
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
                        Enter the 6-digit OTP sent to the customer's phone to complete setup.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="otp" className="text-right">
                        OTP
                        </Label>
                        <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="col-span-3" placeholder="Enter 6-digit code" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={handleAddUser}>Add Customer</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
