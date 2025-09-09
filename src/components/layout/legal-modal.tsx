
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getTerms, type TermsType } from '@/lib/legal-service';

interface LegalModalProps {
  type: TermsType | null;
  onOpenChange: (open: boolean) => void;
}

export function LegalModal({ type, onOpenChange }: LegalModalProps) {
  const [content, setContent] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const isOpen = !!type;

  React.useEffect(() => {
    if (type) {
      setLoading(true);
      getTerms().then(terms => {
        setContent(type === 'terms' ? terms.customer : terms.vendor);
        setLoading(false);
      });
    }
  }, [type]);

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const description = `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 my-4 border rounded-md p-4">
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                </div>
            ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
