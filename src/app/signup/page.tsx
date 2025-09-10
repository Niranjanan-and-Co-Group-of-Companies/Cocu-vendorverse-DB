
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SignupPage() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  // Form state
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [emailOtp, setEmailOtp] = React.useState('');
  const [phoneOtp, setPhoneOtp] = React.useState('');


  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !password) {
      toast({ title: 'Missing Fields', description: 'Please fill out your name and password.', variant: 'destructive' });
      return;
    }
    if (!email && !phone) {
      toast({ title: 'Contact Info Required', description: 'Please provide either an email or a phone number.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      toast({ title: 'Verification Required', description: 'Please check your email/phone for a verification code.' });
    }, 1000);
  };
  
  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && emailOtp !== '123456') {
         toast({ title: 'Invalid Email OTP', variant: 'destructive' });
         return;
    }
    if (phone && phoneOtp !== '123456') {
         toast({ title: 'Invalid Phone OTP', variant: 'destructive' });
         return;
    }
    
    setIsLoading(true);
    // Simulate account creation
     setTimeout(() => {
      setIsLoading(false);
      toast({ title: 'Account Created!', description: 'Welcome to VendorVerse.' });
      // Here you would redirect the user, e.g., router.push('/dashboard');
    }, 1000);
  }
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setPhone(numericValue);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Gift className="h-8 w-8 text-primary" />
            <span className="font-headline">VendorVerse</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">
                {step === 1 ? 'Create an account' : 'Verify Your Account'}
            </CardTitle>
            <CardDescription>
                {step === 1 
                    ? 'Enter your information to get started with VendorVerse.'
                    : `We've sent a code to your ${email ? 'email' : ''}${email && phone ? ' and ' : ''}${phone ? 'phone' : ''}.`
                }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
                <form className="grid gap-4" onSubmit={handleSignup}>
                    <Alert>
                        <AlertDescription className="text-xs">
                            An email or phone number can only be used for one account type (Personalized or Corporate).
                        </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="Max" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={e => setLastName(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">+91</span>
                            <Input id="phone" type="tel" placeholder="98765 43210" value={phone} onChange={handlePhoneChange} className="pl-10" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 animate-spin" />}
                         Create Account
                    </Button>
                    <Button variant="outline" className="w-full">Sign up with Google</Button>
                </form>
            ) : (
                 <form className="grid gap-4" onSubmit={handleVerification}>
                     {email && (
                        <div className="grid gap-2">
                            <Label htmlFor="email-otp">Email OTP</Label>
                            <Input id="email-otp" placeholder="123456" required value={emailOtp} onChange={e => setEmailOtp(e.target.value)} />
                        </div>
                     )}
                      {phone && (
                        <div className="grid gap-2">
                            <Label htmlFor="phone-otp">Phone OTP</Label>
                            <Input id="phone-otp" placeholder="123456" required value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} />
                        </div>
                     )}
                     <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 animate-spin" />}
                        Verify & Continue
                    </Button>
                 </form>
            )}
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
