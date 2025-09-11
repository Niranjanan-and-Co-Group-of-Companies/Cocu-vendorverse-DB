
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendorLoginPage() {
    const router = useRouter();
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would authenticate here, check vendor type,
        // and redirect to the appropriate dashboard.
        router.push('/vendor/personalized/dashboard');
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
            <CardTitle className="text-2xl font-headline">Vendor Portal Login</CardTitle>
            <CardDescription>
                Enter your credentials to access your dashboard.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form className="grid gap-4" onSubmit={handleLogin}>
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
                <div className="text-center text-sm">
                    Don't have an account?{' '}
                    <Link href={'/vendor/signup'} className="underline">
                        Register as a Vendor
                    </Link>
                </div>
                 <div className="text-center text-sm mt-4">
                    Not a vendor?{' '}
                    <Link href="/login" className="underline font-semibold">
                        Login to Customer Portal
                    </Link>
                </div>
            </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
