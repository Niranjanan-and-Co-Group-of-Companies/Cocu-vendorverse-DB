import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary"
                >
                    <path d="m12 14 4-4" />
                    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    <path d="m12 20 4-4" />
                </svg>
                <span className="font-headline">VendorVerse</span>
            </Link>
        </div>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl font-headline">Log In</CardTitle>
            <CardDescription>
                Enter your email below to log in to your account.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form className="grid gap-4">
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
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                    </Link>
                </div>
                <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                Log in
                </Button>
                <Button variant="outline" className="w-full">
                Log in with Google
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline">
                Sign up
                </Link>
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
