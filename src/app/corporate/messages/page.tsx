
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatConversationList } from '@/components/corporate/messages/chat-conversation-list';
import { ChatView } from '@/components/corporate/messages/chat-view';
import { MessageSquare } from 'lucide-react';
import { useCorporateChat } from '@/hooks/use-corporate-chat-store';
import { ChatSafetyDialog } from '@/components/corporate/messages/chat-safety-dialog';

function CorporateMessagesPageContent() {
    const { conversations, selectedConversation, selectConversation, isLoading, initiateNewConversation, isReady } = useCorporateChat();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        if (!isReady) return; // Wait for store to be ready

        const vendorId = searchParams.get('vendorId');
        const productId = searchParams.get('productId');
        const productName = searchParams.get('productName');
        const productImage = searchParams.get('productImage');
        const vendorName = searchParams.get('vendorName');

        if (vendorId && productId && productName && productImage && vendorName) {
            initiateNewConversation({
                vendorId,
                productId,
                productName,
                productImage,
                vendorName,
            });
        }
    }, [searchParams, initiateNewConversation, isReady]);


  return (
    <>
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm h-[calc(100vh-6.5rem)] flex">
            {isLoading && conversations.length === 0 ? (
                <div className="h-full flex-1 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground animate-pulse" />
                </div>
            ) : (
                <>
                    <div className="w-full md:w-1/3 border-r h-full overflow-y-auto">
                        <ChatConversationList
                            conversations={conversations}
                            selectedConversationId={selectedConversation?.id}
                            onSelectConversation={selectConversation}
                        />
                    </div>
                    <div className="hidden md:flex w-2/3 h-full flex-col">
                        <ChatView
                            key={selectedConversation?.id}
                            conversation={selectedConversation}
                        />
                    </div>
                </>
            )}
        </div>
        <ChatSafetyDialog />
    </>
  );
}


export default function CorporateMessagesPage() {
    return (
        <React.Suspense fallback={<div>Loading conversations...</div>}>
            <CorporateMessagesPageContent />
        </React.Suspense>
    );
}
