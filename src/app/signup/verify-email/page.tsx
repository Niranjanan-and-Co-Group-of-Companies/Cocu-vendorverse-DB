
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info } from "lucide-react";

export default function VerifyEmailNoticePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <Info className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="mt-4">This Page is No Longer In Use</CardTitle>
                    <CardDescription>
                        Our signup process has been updated. Email verification is no longer required at this step.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                       If you just created an account, you can now log in directly.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button asChild>
                            <Link href="/login">Go to Login</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
