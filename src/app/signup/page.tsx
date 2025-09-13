
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
import { signupUser } from '@/lib/auth-service';
import type { UserRole } from '@/lib/user-service';

type PortalType = 'personalized' | 'corporate';

export default function SignupPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [portalType, setPortalType] = React.useState<PortalType>('personalized');
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');

  const isFormValid = name && email && phone && password;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast({ title: 'Missing Fields', description: 'Please fill out all required fields.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const role: UserRole = portalType === 'corporate' ? 'corporate-admin' : 'customer';
      
      const result = await signupUser({
        name,
        email,
        phone,
        password,
        role,
      });
      
      if(result.success) {
        toast({
            title: "Verification Email Sent!",
            description: "Please check your email to verify your account and complete registration.",
            duration: 7000,
        });
        // Redirect to a page that tells them to check their email
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
            <CardDescription>Enter your information to get started with VendorVerse.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSignup}>
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
                     Create Account
                </Button>
                <Button variant="outline" className="w-full">Sign up with Google</Button>
            </form>
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
