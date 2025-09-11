
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
import { Eye, EyeOff, Info, Mail, Phone, User, Briefcase } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PortalType = 'personalized' | 'corporate';

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [portalType, setPortalType] = React.useState<PortalType>('personalized');
  const { toast } = useToast();
  const router = useRouter();


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
    // This is a simplified login, in a real app authentication would happen here
    // before redirecting.
    const redirectPath = portalType === 'corporate' ? '/corporate/dashboard' : '/account';
    router.push(redirectPath);
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
    // For now, both signups go to the same page. This can be changed later.
    router.push('/signup');
  };

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
                        <Link href="/vendor/login" onClick={() => onOpenChange(false)} className="underline font-semibold">
                            Login to Vendor Portal
                        </Link>
                    </div>
                </form>
            </TabsContent>
             <TabsContent value="signup">
                 <form className="grid gap-4 py-4" onSubmit={handleSignup}>
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
                    <Button type="submit" className="w-full">Create Account</Button>
                    <div className="text-center text-sm">
                        Are you a vendor?{' '}
                        <Link href="/vendor/signup" onClick={() => onOpenChange(false)} className="underline font-semibold">
                            Register as a Vendor
                        </Link>
                    </div>
                 </form>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
