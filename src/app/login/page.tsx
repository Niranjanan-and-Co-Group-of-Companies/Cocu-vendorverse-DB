
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function LoginPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
            <Link href="/" className="inline-block">
                <Image src="/logo.svg" alt="CO&Cu logo" width={160} height={64} className="h-16 w-auto" />
            </Link>
        </div>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl font-headline">Customer Login</CardTitle>
            <CardDescription>
                Enter your credentials to access your account.
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
                    <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                </Button>
                <div className="text-center text-sm">
                    Don't have an account?{' '}
                    <Link href={'/signup'} className="underline">
                        Sign up
                    </Link>
                </div>
                 <div className="text-center text-sm mt-4">
                    Are you a vendor?{' '}
                    <Link href="/vendor/login" className="underline font-semibold">
                        Login to Vendor Portal
                    </Link>
                </div>
            </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
