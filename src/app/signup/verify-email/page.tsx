
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailNoticePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <MailCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="mt-4">Please Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a verification link to your email address. Please click the link to complete your registration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Didn't receive an email? Check your spam folder or request a new link.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button disabled>Resend Link</Button>
                        <Button variant="outline" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
