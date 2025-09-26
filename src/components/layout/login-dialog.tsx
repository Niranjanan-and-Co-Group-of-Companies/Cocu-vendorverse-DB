
'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Info, Mail, Phone, User, Briefcase, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { loginUser, signupUser, checkUserExists } from '@/lib/auth-service';
import type { UserRole } from '@/lib/user-service';
import { sendOtp, verifyOtp } from '@/lib/otp-service';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PortalType = 'personalized' | 'corporate';

function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await loginUser(email, password);
            if (result.success) {
                toast({
                    title: 'Login Successful',
                    description: 'Welcome back!',
                });
                onLoginSuccess();
                router.push(result.redirectPath || '/');
            } else {
                toast({
                    title: 'Login Failed',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'An Error Occurred',
                description: 'Could not log you in. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <form className="grid gap-4 py-4" onSubmit={handleLogin}>
            <div className="grid gap-2">
                <Label htmlFor="email-login">Email or Phone</Label>
                <Input id="email-login" name="email" type="text" placeholder="m@example.com or +91..." required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password-login">Password</Label>
                <Input id="password-login" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                Login
            </Button>
            <div className="text-center text-sm">
                Are you a vendor?{' '}
                <Link href="/vendor/login" onClick={onLoginSuccess} className="underline font-semibold">
                    Login to Vendor Portal
                </Link>
            </div>
        </form>
    );
}


function SignupForm({ onSignupSuccess }: { onSignupSuccess: () => void }) {
    const [step, setStep] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [portalType, setPortalType] = React.useState<PortalType>('personalized');
    const { toast } = useToast();
    const router = useRouter();

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [otp, setOtp] = React.useState('');
    
    const isStep1Valid = name && password && (email || phone);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStep1Valid) {
            toast({ title: 'Missing Fields', description: 'Please fill out all required fields.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            const { exists, message } = await checkUserExists(email, phone);
            if (exists) {
                toast({ title: 'Account Exists', description: message, variant: 'destructive' });
                return;
            }
            
            const otpTarget = email || phone;
            const result = await sendOtp(otpTarget, name);
            if(result.success) {
                setStep(2);
                toast({ title: 'Verification Required', description: result.message });
            } else {
                 toast({ title: 'Failed to Send OTP', description: result.message, variant: 'destructive' });
            }
        } catch (error: any) {
             toast({ title: 'Signup Error', description: error.message || 'An error occurred.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

     const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const otpTarget = email || phone;
            const verificationResult = await verifyOtp(otpTarget, otp);
            
            if (!verificationResult.success) {
                toast({ title: 'Invalid OTP', description: verificationResult.message, variant: 'destructive' });
                return;
            }

            const role: UserRole = portalType === 'corporate' ? 'corporate-admin' : 'customer';
            await signupUser({ name, email, phone, password, role });
            
            toast({ title: 'Account Created!', description: 'Welcome to CO&Cu. You can now log in.' });
            onSignupSuccess(); 
        } catch (error: any) {
            toast({ title: 'Signup Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/\D/g, '').slice(0, 10);
        setPhone(numericValue);
    };

    if (step === 1) {
        return (
             <form className="grid gap-4 py-4" onSubmit={handleSignup}>
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
                            <RadioGroupItem value="personalized" id="dialog-signup-personal" className="peer sr-only" />
                            <Label htmlFor="dialog-signup-personal" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <User className="mb-2"/> Personalized
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="corporate" id="dialog-signup-corporate" className="peer sr-only" />
                            <Label htmlFor="dialog-signup-corporate" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <Briefcase className="mb-2"/> Corporate
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="dialog-full-name">Full name</Label>
                    <Input id="dialog-full-name" placeholder="Max Robinson" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dialog-email">Email</Label>
                    <Input id="dialog-email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dialog-phone">Phone Number</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">+91</span>
                        <Input id="dialog-phone" type="tel" placeholder="98765 43210" value={phone} onChange={handlePhoneChange} className="pl-10" />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dialog-password">Password</Label>
                    <Input id="dialog-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !isStep1Valid}>
                        {isLoading && <Loader2 className="mr-2 animate-spin" />}
                        Create Account
                </Button>
            </form>
        );
    }

    return (
         <form className="grid gap-4 py-4" onSubmit={handleVerification}>
            <p className="text-sm text-center text-muted-foreground">We've sent a code to your {email || `+91${phone}`}. Please enter it below to verify.</p>
            <div className="grid gap-2">
                <Label htmlFor="dialog-otp">Verification Code</Label>
                <Input id="dialog-otp" placeholder="Enter 6-digit code" required value={otp} onChange={e => setOtp(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 animate-spin" />}
            Verify &amp; Continue
        </Button>
        </form>
    );

}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Welcome to CO&Cu</DialogTitle>
                    <DialogDescription>
                        Log in or create an account to continue.
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                       <LoginForm onLoginSuccess={() => onOpenChange(false)} />
                    </TabsContent>
                    <TabsContent value="signup">
                        <SignupForm onSignupSuccess={() => onOpenChange(false)} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
