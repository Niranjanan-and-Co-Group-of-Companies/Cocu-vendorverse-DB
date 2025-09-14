
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Loader2, Eye, EyeOff, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation';
import { createVendorApplication, type VendorType, checkVendorExists } from '@/lib/vendors-service';
import { sendOtp, verifyOtp } from '@/lib/otp-service';

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
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  // OTP state
  const [otp, setOtp] = React.useState('');
  const [countdown, setCountdown] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const passwordCriteria = "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";

  const startCountdown = () => {
    setCountdown(30);
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


  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorType) {
        toast({ title: 'Please select a vendor type', variant: 'destructive'});
        return;
    }
    setStep(2);
  }

  const handleStep2Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        toast({ title: 'Password Not Strong Enough', description: passwordCriteria, variant: 'destructive', duration: 7000});
        return;
    }
    if (password !== confirmPassword) {
        toast({ title: 'Passwords do not match', variant: 'destructive'});
        return;
    }

    setIsLoading(true);

    try {
        const fullPhoneNumber = `+91${phone}`;
        const { exists, message } = await checkVendorExists(email, fullPhoneNumber);

        if (exists) {
            toast({
                title: "Account Already Exists",
                description: message,
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        const otpResult = await sendOtp(phone);
        if (otpResult.success) {
            setStep(3);
            startCountdown();
            toast({ title: "Verification Required", description: otpResult.message });
        } else {
            toast({ title: "Failed to Send OTP", description: otpResult.message, variant: "destructive"});
        }

    } catch (error) {
        console.error(error);
        toast({ title: "An Error Occurred", description: "Could not proceed with signup. Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }
  
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

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vendorType) {
        toast({ title: "Vendor type missing", description: "An error occurred, please start over.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    const verificationResult = await verifyOtp(phone, otp);
    if (!verificationResult.success) {
        toast({ title: "Invalid OTP", description: verificationResult.message, variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
        await createVendorApplication({ storeName, firstName, lastName, email, phone, vendorType });
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
                {step === 3 && `Enter the OTP sent to +91 ${phone} to verify your number.`}
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
                         <div className="flex items-center gap-1">
                            <Label htmlFor="password">Password</Label>
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">{passwordCriteria}</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                         </div>
                        <div className="relative">
                            <Input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                         <div className="relative">
                            <Input id="confirm-password" name="confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
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
                         Submit Application
                    </Button>
                     <Button variant="link" size="sm" onClick={() => setStep(2)} disabled={isLoading}>Go Back</Button>
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
