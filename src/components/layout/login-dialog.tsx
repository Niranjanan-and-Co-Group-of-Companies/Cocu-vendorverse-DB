
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

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
    // This is a simplified login, in a real app authentication would happen here
    // before redirecting.
    router.push('/login');
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
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
                </form>
            </TabsContent>
             <TabsContent value="signup">
                <div className="text-center py-8">
                     <p className="mb-4">Are you a customer or a vendor?</p>
                     <div className="grid grid-cols-2 gap-4">
                        <Button asChild variant="outline" size="lg" className="h-20 flex-col" onClick={() => onOpenChange(false)}>
                            <Link href="/signup">
                                <User className="mb-2"/> Customer
                            </Link>
                        </Button>
                         <Button asChild variant="outline" size="lg" className="h-20 flex-col" onClick={() => onOpenChange(false)}>
                            <Link href="/vendor/signup">
                                <Briefcase className="mb-2"/> Vendor
                            </Link>
                        </Button>
                     </div>
                </div>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
