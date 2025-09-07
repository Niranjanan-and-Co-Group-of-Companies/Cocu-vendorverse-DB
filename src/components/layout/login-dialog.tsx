
'use client';

import * as React from 'react';
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
import { Eye, EyeOff, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [portalType, setPortalType] = React.useState<'personalized' | 'corporate'>('personalized');
  const [signupStep, setSignupStep] = React.useState(1);
  const [otp, setOtp] = React.useState('');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Logging in to ${portalType} portal...`);
    onOpenChange(false);
  };
  
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd check if passwords match and if email exists, then send an OTP.
    console.log(`Initiating sign up for ${portalType} portal...`);
    setSignupStep(2);
     toast({
        title: "Verification Code Sent",
        description: "A one-time code has been sent to your email address.",
    });
  };

  const handleVerifyAndCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
        toast({
            title: "Invalid Verification Code",
            description: "The code you entered is incorrect. Please try again.",
            variant: "destructive"
        });
        return;
    }
    console.log('Account verified and created!');
    toast({
        title: "Account Created!",
        description: "You have been successfully signed up."
    });
    onOpenChange(false);
  }
  
  React.useEffect(() => {
    // Reset to first step when dialog is closed
    if (!open) {
      setTimeout(() => {
        setSignupStep(1);
        setOtp('');
      }, 200);
    }
  }, [open]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to VendorVerse</DialogTitle>
          <DialogDescription>
            Log in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4">
             <RadioGroup defaultValue="personalized" className="grid grid-cols-2 gap-4">
                <div>
                    <RadioGroupItem value="personalized" id="personalized" className="peer sr-only" />
                    <Label
                    htmlFor="personalized"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                    Personalized Portal
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="corporate" id="corporate" className="peer sr-only" />
                    <Label
                    htmlFor="corporate"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                    Corporate Portal
                    </Label>
                </div>
            </RadioGroup>
        </div>


        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <form className="grid gap-4 py-4" onSubmit={handleLogin}>
                    <div className="grid gap-2">
                        <Label htmlFor="email-login">Email</Label>
                        <Input id="email-login" type="email" placeholder="m@example.com" required />
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
                </form>
            </TabsContent>
             <TabsContent value="signup">
                {signupStep === 1 && (
                    <form className="grid gap-4 py-4" onSubmit={handleSignupSubmit}>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            An email can only be used for one account type (Personalized or Corporate).
                          </AlertDescription>
                        </Alert>
                        <div className="grid gap-2">
                            <Label htmlFor="name-signup">Name</Label>
                            <Input id="name-signup" placeholder="John Doe" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email-signup">Email</Label>
                            <Input id="email-signup" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password-signup">Password</Label>
                            <div className="relative">
                                <Input id="password-signup" type={showPassword ? 'text' : 'password'} required />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password-signup">Confirm Password</Label>
                            <div className="relative">
                                <Input id="confirm-password-signup" type={showConfirmPassword ? 'text' : 'password'} required />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full">Create Account</Button>
                        <Button variant="outline" className="w-full">Sign up with Google</Button>
                    </form>
                )}
                 {signupStep === 2 && (
                    <form className="grid gap-4 py-4" onSubmit={handleVerifyAndCreate}>
                        <DialogDescription className="text-center">
                            We've sent a 6-digit code to your email. Please enter it below to verify your account. (Hint: 123456)
                        </DialogDescription>
                        <div className="grid gap-2">
                            <Label htmlFor="otp-signup">Verification Code</Label>
                            <Input id="otp-signup" type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Verify & Create Account</Button>
                         <Button variant="link" size="sm" type="button" onClick={() => setSignupStep(1)}>Back</Button>
                    </form>
                 )}
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
