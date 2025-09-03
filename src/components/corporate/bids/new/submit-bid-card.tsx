
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SubmitBidCardProps {
    isSubmitting: boolean;
    itemCount: number;
    onSubmit: () => void;
}

export function SubmitBidCard({ isSubmitting, itemCount, onSubmit }: SubmitBidCardProps) {
    const isDisabled = isSubmitting || itemCount < 2;

    const SubmitButton = (
        <Button className="w-full" size="lg" disabled={isDisabled} onClick={onSubmit}>
            <Send className="mr-2" />
            Submit Bid Request
        </Button>
    );

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
                
                {isDisabled && itemCount < 2 ? (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">{SubmitButton}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>You must add at least 2 products to create a bid request.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    SubmitButton
                )}

            </CardContent>
        </Card>
    );
}
