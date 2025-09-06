
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { getTermsLastUpdated, type TermsType } from '@/lib/legal-service';
import { ScrollArea } from '../ui/scroll-area';

interface TermsUpdateDialogProps {
    userType: TermsType;
}

export function TermsUpdateDialog({ userType }: TermsUpdateDialogProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [termsContent, setTermsContent] = React.useState('');
    const [lastUpdated, setLastUpdated] = React.useState<number | null>(null);
    const storageKey = `terms-${userType}-acknowledged`;

    React.useEffect(() => {
        const checkTerms = async () => {
            const { content, lastUpdated: newLastUpdated } = await getTermsLastUpdated(userType);
            setTermsContent(content);
            setLastUpdated(newLastUpdated);
            
            const acknowledgedTimestamp = localStorage.getItem(storageKey);

            if (!acknowledgedTimestamp || (newLastUpdated && newLastUpdated > parseInt(acknowledgedTimestamp, 10))) {
                setIsOpen(true);
            }
        };

        checkTerms();
    }, [userType, storageKey]);

    const handleAcknowledge = () => {
        if (lastUpdated) {
            localStorage.setItem(storageKey, String(lastUpdated));
        }
        setIsOpen(false);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Our Terms Have Been Updated</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review the latest terms and conditions below before continuing to use our platform.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <ScrollArea className="h-80 my-4 border rounded-md p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: termsContent.replace(/\n/g, '<br />') }} />
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleAcknowledge}>Acknowledge & Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
