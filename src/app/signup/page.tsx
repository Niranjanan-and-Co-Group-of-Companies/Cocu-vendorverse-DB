
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Loader2, Briefcase, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';

type PortalType = 'personalized' | 'corporate';


export default function SignupPage() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [portalType, setPortalType] = React.useState<PortalType>('personalized');
  const { toast } = useToast();
  const router = useRouter();


  // Form state
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [emailOtp, setEmailOtp] = React.useState('');
  const [phoneOtp, setPhoneOtp] = React.useState('');

  const isStep1Valid = firstName && lastName && password && (email || phone);


  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid) {
      toast({ title: 'Missing Fields', description: 'Please fill out all required fields.', variant: 'destructive' });
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
      // Redirect based on selected portal type
      const redirectPath = portalType === 'corporate' ? '/corporate/dashboard' : '/account';
      router.push(redirectPath);
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
                    <div className="space-y-2">
                        <Label>Account Type</Label>
                        <RadioGroup value={portalType} onValueChange={(value: PortalType) => setPortalType(value)} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="personalized" id="signup-personal" className="peer sr-only" />
                                <Label htmlFor="signup-personal" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    <User className="mb-2"/> Personalized
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="corporate" id="signup-corporate" className="peer sr-only" />
                                <Label htmlFor="signup-corporate" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    <Briefcase className="mb-2"/> Corporate
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
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
                     <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">+91</span>
                            <Input id="phone" type="tel" placeholder="98765 43210" value={phone} onChange={handlePhoneChange} className="pl-10" />
                        </div>
                    </div>
                     {!email && !phone && (
                        <p className="text-xs text-muted-foreground text-center">Please provide an email or a phone number to create an account.</p>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !isStep1Valid}>
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
