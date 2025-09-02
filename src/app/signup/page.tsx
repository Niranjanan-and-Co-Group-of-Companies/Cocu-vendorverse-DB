import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
       <div className="w-full max-w-sm">
        <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
                <Gift className="h-8 w-8 text-primary" />
                <span className="font-headline">GiftSphere</span>
            </Link>
        </div>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl font-headline">Create an account</CardTitle>
            <CardDescription>
                Enter your information to get started with GiftSphere.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="Max" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Robinson" required />
                </div>
                </div>
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                Create account
                </Button>
                <Button variant="outline" className="w-full">
                Sign up with Google
                </Button>
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
