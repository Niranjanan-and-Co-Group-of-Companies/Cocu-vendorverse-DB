

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';
import { createVendorApplication, type VendorType } from '@/lib/vendors-service';

export default function VendorSignupPage() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [vendorType, setVendorType] = React.useState<VendorType | ''>('');
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [storeName, setStoreName] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  // OTP state
  const [emailOtp, setEmailOtp] = React.useState('');
  const [phoneOtp, setPhoneOtp] = React.useState('');


  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorType) {
        toast({ title: 'Please select a vendor type', variant: 'destructive'});
        return;
    }
    setStep(2);
  }

  const handleStep2Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast({ title: 'Passwords do not match', variant: 'destructive'});
        return;
    }
    // Simulate sending OTPs
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        setStep(3);
        toast({ title: "Verification Required", description: "OTPs have been sent to your email and phone." });
    }, 1000);
  }

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailOtp !== '123456' || phoneOtp !== '123456') {
        toast({ title: "Invalid OTP", description: "One or both of your verification codes are incorrect.", variant: "destructive" });
        return;
    }
    if (!vendorType) {
        toast({ title: "Vendor type missing", description: "An error occurred, please start over.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
        await createVendorApplication({ storeName, firstName, lastName, email, phone: `+91${phone}`, vendorType });
        toast({
            title: "Application Submitted!",
            description: "Your application is under review. We'll be in touch within 2-3 business days.",
            duration: 5000,
        });
        router.push('/vendor/login');
    } catch (error: any) {
        console.error(error);
        toast({ title: 'Registration Failed', description: error.message || 'Could not submit your application. Please try again.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setPhone(numericValue);
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Gift className="h-8 w-8 text-primary" />
            <span className="font-headline">VendorVerse</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Become a Vendor</CardTitle>
            <CardDescription>
                {step === 1 && 'Start your journey by telling us what you sell.'}
                {step === 2 && 'Complete your registration details.'}
                {step === 3 && 'Verify your contact information to complete your application.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
                <form className="grid gap-6" onSubmit={handleStep1Submit}>
                     <div className="grid gap-2">
                        <Label>What kind of products will you be selling?</Label>
                        <Select value={vendorType} onValueChange={(value) => setVendorType(value as VendorType)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vendor type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="personalized">Personalized & Retail Products</SelectItem>
                                <SelectItem value="corporate">Corporate & Bulk Products</SelectItem>
                                <SelectItem value="both">Both Personalized & Corporate</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                     <Button type="submit" className="w-full" disabled={!vendorType}>
                        Continue
                     </Button>
                </form>
            )}
            {step === 2 && (
                 <form className="grid gap-4" onSubmit={handleStep2Submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="store-name">Store Name</Label>
                        <Input id="store-name" name="store-name" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="e.g., Creative Crafts Co." required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <Input id="first-name" name="first-name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input id="last-name" name="last-name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">+91</span>
                            <Input id="phone" type="tel" placeholder="98765 43210" value={phone} onChange={handlePhoneChange} className="pl-10" required/>
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" name="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                     <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 animate-spin" />}
                         Continue to Verification
                    </Button>
                 </form>
            )}
            {step === 3 && (
                <form className="grid gap-4" onSubmit={handleFinalSubmit}>
                     <div className="grid gap-2">
                        <Label htmlFor="email-otp">Email OTP</Label>
                        <Input id="email-otp" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} placeholder="Enter 6-digit code" required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone-otp">Phone OTP</Label>
                        <Input id="phone-otp" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} placeholder="Enter 6-digit code" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 animate-spin" />}
                         Submit Application
                    </Button>
                     <Button variant="link" size="sm" onClick={() => setStep(2)}>Go Back</Button>
                </form>
            )}
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/vendor/login" className="underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
