
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const ADMIN_EMAIL = 'admin@vendorverse.com';
const ADMIN_PASSWORD = 'password';
const MOCK_OTP = '123456';

export default function AdminLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [step, setStep] = React.useState(1);
    
    // Step 1 state
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    // Step 2 state
    const [emailOtp, setEmailOtp] = React.useState('');
    const [phoneOtp, setPhoneOtp] = React.useState('');

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate password check
        await new Promise(resolve => setTimeout(resolve, 500));

        if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            toast({
                title: 'Password Verified',
                description: 'Please complete the second verification step.',
            });
            setStep(2);
        } else {
            toast({
                title: 'Login Failed',
                description: 'Invalid credentials. Please try again.',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };

    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate OTP check
        await new Promise(resolve => setTimeout(resolve, 500));

        if (emailOtp === MOCK_OTP && phoneOtp === MOCK_OTP) {
            toast({
                title: 'Admin Login Successful',
                description: 'Welcome back!',
            });
            // In a real app, you would set a secure session cookie here.
            sessionStorage.setItem('admin-auth', 'true');
            router.push('/admin');
        } else {
            toast({
                title: 'Verification Failed',
                description: 'One or both of the OTPs are incorrect.',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
            <Link href="/" className="inline-block">
                <Image src="/logo.svg" alt="CO&Cu logo" width={160} height={64} className="h-16 w-auto" />
            </Link>
        </div>
        <Card>
            <CardHeader className="text-center">
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
             </div>
            <CardTitle className="text-2xl font-headline">Admin Portal Login</CardTitle>
            <CardDescription>
              {step === 1 ? "Enter your admin credentials." : "Complete the two-factor authentication."}
            </CardDescription>
            </CardHeader>
            <CardContent>
            {step === 1 ? (
                <form className="grid gap-4" onSubmit={handlePasswordSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue
                    </Button>
                </form>
            ) : (
                 <form className="grid gap-4" onSubmit={handleOtpSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email-otp">
                            <div className="flex items-center gap-2">
                                <Mail className="text-muted-foreground" /> Email OTP
                            </div>
                        </Label>
                        <Input id="email-otp" name="email-otp" placeholder="Enter code sent to email" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone-otp">
                             <div className="flex items-center gap-2">
                                <Phone className="text-muted-foreground" /> Phone OTP
                            </div>
                        </Label>
                        <Input id="phone-otp" name="phone-otp" placeholder="Enter code sent to phone" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify & Login
                    </Button>
                    <Button variant="link" size="sm" onClick={() => setStep(1)} disabled={isLoading}>Back to Password</Button>
                </form>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
