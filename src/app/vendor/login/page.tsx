
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { getDoc, query, collection, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Vendor } from '@/lib/vendors-service';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function VendorLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;

        // In a real app, you would authenticate with password here.
        // For simulation, we'll fetch the vendor by email to check their type.
        try {
            const q = query(collection(db, 'vendors'), where('email', '==', email), limit(1));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                toast({ title: 'Login Failed', description: 'No vendor account found with that email.', variant: 'destructive' });
                return;
            }

            const vendor = snapshot.docs[0].data() as Vendor;

            if (vendor.status !== 'Active') {
                toast({ title: 'Account Not Active', description: 'Your account is still pending approval or has been suspended.', variant: 'destructive' });
                return;
            }

            switch (vendor.type) {
                case 'personalized':
                    router.push('/vendor/personalized/dashboard');
                    break;
                case 'corporate':
                    router.push('/vendor/corporate/dashboard');
                    break;
                case 'both':
                    router.push('/vendor/both/dashboard');
                    break;
                default:
                    // Fallback to personalized dashboard
                    router.push('/vendor/personalized/dashboard');
                    break;
            }

        } catch (error) {
            console.error("Login error:", error);
            toast({ title: 'Error', description: 'An error occurred during login.', variant: 'destructive' });
        }
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
                    <Input id="email" name="email" type="text" placeholder="m@example.com" required />
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
