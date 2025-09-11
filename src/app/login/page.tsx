
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, User, Briefcase } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [portalType, setPortalType] = React.useState<'customer' | 'vendor'>('customer');
    const router = useRouter();
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would authenticate here.
        // For now, we just redirect to the appropriate dashboard.
        if (portalType === 'vendor') {
            // A real app would check vendor type (Personalized, Corporate, Both) and redirect accordingly.
            // We'll default to the personalized vendor dashboard for now.
            router.push('/vendor/personalized/dashboard');
        } else {
            router.push('/account'); // Redirect customer to their account page
        }
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
                <Gift className="h-8 w-8 text-primary" />
                <span className="font-headline">VendorVerse</span>
            </Link>
        </div>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl font-headline">Portal Login</CardTitle>
            <CardDescription>
                Select your portal and enter your credentials.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form className="grid gap-4" onSubmit={handleLogin}>
                 <RadioGroup value={portalType} onValueChange={(value) => setPortalType(value as any)} className="grid grid-cols-2 gap-4">
                    <div>
                        <RadioGroupItem value="customer" id="customer" className="peer sr-only" />
                        <Label htmlFor="customer" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <User className="mb-2"/>
                            Customer
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="vendor" id="vendor" className="peer sr-only" />
                        <Label htmlFor="vendor" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Briefcase className="mb-2"/>
                            Vendor
                        </Label>
                    </div>
                </RadioGroup>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email or Phone</Label>
                    <Input id="email" type="text" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                        </Link>
                    </div>
                    <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                    Login
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href={portalType === 'vendor' ? '/vendor/signup' : '/signup'} className="underline">
                        Sign up
                    </Link>
                </div>
            </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
