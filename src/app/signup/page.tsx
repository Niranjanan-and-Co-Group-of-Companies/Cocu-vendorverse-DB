
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Loader2, User, Briefcase, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { signupUser, checkUserExists } from '@/lib/auth-service';
import type { UserRole } from '@/lib/user-service';
import { sendOtp, verifyOtp } from '@/lib/otp-service';

type PortalType = 'personalized' | 'corporate';

export default function SignupPage() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [portalType, setPortalType] = React.useState<PortalType>('personalized');
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');
  
  // Resend OTP state
  const [countdown, setCountdown] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => {
    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if(timerRef.current) clearInterval(timerRef.current);
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


  const isFormValid = name && email && phone && password;

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast({ title: 'Missing Fields', description: 'Please fill out all required fields.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);

    try {
        const { exists, message } = await checkUserExists(email, phone);
        if (exists) {
            toast({ title: 'Account Exists', description: message, variant: 'destructive' });
            setIsLoading(false);
            return;
        }

        const otpResult = await sendOtp(phone);
        if (otpResult.success) {
            setStep(2);
            startCountdown();
            toast({ title: 'Verification Required', description: otpResult.message });
        } else {
            toast({ title: 'Failed to Send OTP', description: otpResult.message, variant: 'destructive' });
        }
    } catch (error: any) {
        toast({ title: 'Signup Error', description: error.message || 'An error occurred.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    setIsLoading(true);
    const otpResult = await sendOtp(phone);
    if(otpResult.success) {
        startCountdown();
        toast({ title: "New OTP Sent", description: "A new verification code has been sent to your phone." });
    } else {
        toast({ title: 'Failed to Send OTP', description: otpResult.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const verificationResult = await verifyOtp(phone, otp);
    if (!verificationResult.success) {
        toast({ title: 'Invalid OTP', description: verificationResult.message, variant: 'destructive' });
        setIsLoading(false);
        return;
    }

    try {
      const role: UserRole = portalType === 'corporate' ? 'corporate-admin' : 'customer';
      const result = await signupUser({ name, email, phone, password, role });
      
      if(result.success) {
        toast({
            title: "Verification Email Sent!",
            description: "Please check your email to verify your account and complete registration.",
            duration: 7000,
        });
        router.push('/signup/verify-email');
      }

    } catch (error: any) {
        toast({ title: 'Signup Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive'});
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
            <CardTitle className="text-2xl font-headline">Create an account</CardTitle>
            <CardDescription>
                {step === 1 ? "Enter your information to get started with VendorVerse." : `Enter the OTP sent to +91 ${phone} to verify your number.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
                 <form className="grid gap-4" onSubmit={handleStep1Submit}>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            An email or phone number can only be used to register one type of account (either Personalized or Corporate).
                        </AlertDescription>
                    </Alert>
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
                    <div className="grid gap-2">
                        <Label htmlFor="full-name">Full name</Label>
                        <Input id="full-name" placeholder="Max Robinson" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
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
                        <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
                         {isLoading && <Loader2 className="mr-2 animate-spin" />}
                         Continue
                    </Button>
                    <Button variant="outline" className="w-full">Sign up with Google</Button>
                </form>
            ) : (
                <form className="grid gap-4" onSubmit={handleFinalSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="phone-otp">Phone OTP</Label>
                        <Input id="phone-otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit code" required />
                    </div>
                     <div className="text-center text-sm text-muted-foreground">
                        {countdown > 0 ? (
                            `Resend code in ${countdown}s`
                        ) : (
                             <Button type="button" variant="link" size="sm" onClick={handleResendOtp} disabled={isLoading}>
                                Resend OTP
                            </Button>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                         {isLoading && <Loader2 className="mr-2 animate-spin" />}
                         Verify & Create Account
                    </Button>
                    <Button variant="link" size="sm" onClick={() => setStep(1)} disabled={isLoading}>Go Back</Button>
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
