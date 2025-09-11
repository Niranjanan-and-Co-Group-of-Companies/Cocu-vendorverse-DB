
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

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PortalType = 'personalized' | 'corporate';

function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [portalType, setPortalType] = React.useState<PortalType>('personalized');
    const [showPassword, setShowPassword] = React.useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLoginSuccess();
        const redirectPath = portalType === 'corporate' ? '/corporate/dashboard' : '/account';
        router.push(redirectPath);
    };

    return (
         <form className="grid gap-4 py-4" onSubmit={handleLogin}>
            <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup value={portalType} onValueChange={(value: PortalType) => setPortalType(value)} className="grid grid-cols-2 gap-4">
                    <div>
                        <RadioGroupItem value="personalized" id="login-personal" className="peer sr-only" />
                        <Label htmlFor="login-personal" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <User className="mb-2"/> Personalized
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="corporate" id="login-corporate" className="peer sr-only" />
                        <Label htmlFor="login-corporate" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Briefcase className="mb-2"/> Corporate
                        </Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email-login">Email or Phone</Label>
                <Input id="email-login" type="text" placeholder="m@example.com or +91..." required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password-login">Password</Label>
                    <div className="relative">
                    <Input id="password-login" type={showPassword ? 'text' : 'password'} required />
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
            </div>
            <Button type="submit" className="w-full">Login</Button>
            <Button variant="outline" className="w-full">Login with Google</Button>
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
        setTimeout(() => {
            setIsLoading(false);
            toast({ title: 'Account Created!', description: 'Welcome to VendorVerse.' });
            onSignupSuccess(); // Close the dialog
            const redirectPath = portalType === 'corporate' ? '/corporate/dashboard' : '/account';
            router.push(redirectPath);
        }, 1000);
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
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="dialog-first-name">First name</Label>
                        <Input id="dialog-first-name" placeholder="Max" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dialog-last-name">Last name</Label>
                        <Input id="dialog-last-name" placeholder="Robinson" required value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
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
                <Button variant="outline" className="w-full">Sign up with Google</Button>
            </form>
        );
    }

    return (
         <form className="grid gap-4 py-4" onSubmit={handleVerification}>
            <p className="text-sm text-center text-muted-foreground">We've sent a code to your {email ? 'email' : ''}{email && phone ? ' and ' : ''}{phone ? 'phone' : ''}. (Hint: 123456)</p>
            {email && (
            <div className="grid gap-2">
                <Label htmlFor="dialog-email-otp">Email OTP</Label>
                <Input id="dialog-email-otp" placeholder="123456" required value={emailOtp} onChange={e => setEmailOtp(e.target.value)} />
            </div>
            )}
            {phone && (
            <div className="grid gap-2">
                <Label htmlFor="dialog-phone-otp">Phone OTP</Label>
                <Input id="dialog-phone-otp" placeholder="123456" required value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} />
            </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 animate-spin" />}
            Verify & Continue
        </Button>
        </form>
    );

}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Welcome to VendorVerse</DialogTitle>
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
