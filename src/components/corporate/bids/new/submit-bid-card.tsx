

'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBidRequest } from '@/hooks/use-bid-request';

interface SubmitBidCardProps {
    isSubmitting: boolean;
    onSubmit: () => void;
}

export function SubmitBidCard({ isSubmitting, onSubmit }: SubmitBidCardProps) {
    const { items } = useBidRequest();
    const hasOutOfStockItems = items.some(item => item.isOutOfStock);
    const isDisabled = isSubmitting || items.length < 2 || hasOutOfStockItems;

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
                
                {isDisabled && (items.length < 2 || hasOutOfStockItems) ? (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">{SubmitButton}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {hasOutOfStockItems 
                                        ? "Remove out-of-stock items to proceed." 
                                        : "You must add at least 2 products to create a bid request."}
                                </p>
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
