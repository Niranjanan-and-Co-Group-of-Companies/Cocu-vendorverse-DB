
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';

interface SubmitBidCardProps {
    disabled: boolean;
    onSubmit: () => void;
}

export function SubmitBidCard({ disabled, onSubmit }: SubmitBidCardProps) {
    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                 <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Final Step</AlertTitle>
                    <AlertDescription>
                       You will be asked to verify your identity via a one-time password (OTP) before the bid is submitted to vendors.
                    </AlertDescription>
                </Alert>
                <Button className="w-full" size="lg" disabled={disabled} onClick={onSubmit}>
                    <Send className="mr-2" />
                    Submit Bid Request
                </Button>
            </CardContent>
        </Card>
    );
}
