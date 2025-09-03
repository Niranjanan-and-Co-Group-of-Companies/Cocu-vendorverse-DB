
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldAlert } from 'lucide-react';
import { useCorporateChat } from '@/hooks/use-corporate-chat-store';

export function ChatSafetyDialog() {
  const { isSafetyNoticeOpen, closeSafetyNotice, newConversationInfo } = useCorporateChat();
  const router = useRouter();

  const handleContinue = () => {
    if (newConversationInfo) {
      const { vendorId, productId, productName, productImage, vendorName } = newConversationInfo;
      const query = new URLSearchParams({
        vendorId,
        productId,
        productName,
        productImage,
        vendorName,
      }).toString();
      
      router.push(`/corporate/messages?${query}`);
    }
    closeSafetyNotice(true);
  };
  
  return (
    <AlertDialog open={isSafetyNoticeOpen} onOpenChange={(open) => !open && closeSafetyNotice(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                <ShieldAlert className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          <AlertDialogTitle className="text-center">Communication Guidelines</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            To protect your privacy and ensure platform safety, please do not share any personal or company contact information (phone numbers, email addresses, etc.) in the chat. All communication should be kept within VendorVerse.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel onClick={() => closeSafetyNotice(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>I Understand, Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
