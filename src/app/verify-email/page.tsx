

'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyUserEmail } from '@/lib/auth-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function VerificationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    
    const [status, setStatus] = React.useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = React.useState('Verifying your email address...');

    React.useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found. Please check your link.');
            return;
        }

        const verify = async () => {
            const result = await verifyUserEmail(token);
            if (result.success) {
                setStatus('success');
                setMessage(result.message);
                setTimeout(() => router.push('/login'), 3000); // Redirect to login after 3 seconds
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        };

        verify();
    }, [token, router]);

    return (
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    {status === 'verifying' && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
                    {status === 'success' && <CheckCircle className="h-10 w-10 text-green-500" />}
                    {status === 'error' && <XCircle className="h-10 w-10 text-destructive" />}
                </div>
                <CardTitle className="mt-4">
                    {status === 'verifying' && 'Verification in Progress'}
                    {status === 'success' && 'Verification Successful!'}
                    {status === 'error' && 'Verification Failed'}
                </CardTitle>
                <CardDescription>
                    {message}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {status === 'success' && (
                     <p className="text-sm text-muted-foreground">
                        Redirecting you to the login page...
                    </p>
                )}
                 {status === 'error' && (
                    <Button asChild>
                        <Link href="/signup">Back to Sign Up</Link>
                    </Button>
                 )}
            </CardContent>
        </Card>
    );
}


export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <React.Suspense fallback={<Card className="w-full max-w-md text-center p-8"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></Card>}>
                <VerificationContent />
            </React.Suspense>
        </div>
    );
}
