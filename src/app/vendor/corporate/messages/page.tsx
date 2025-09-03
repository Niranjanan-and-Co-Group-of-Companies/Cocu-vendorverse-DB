
'use client';

import * as React from 'react';
import { VendorConversationList } from '@/components/vendor/messages/vendor-conversation-list';
import { VendorChatView } from '@/components/vendor/messages/vendor-chat-view';
import { onVendorConversationsUpdate, type VendorConversation } from '@/lib/vendor/messages-service';
import { MessageSquare } from 'lucide-react';

const VENDOR_ID = 'vendor001';

export default function VendorMessagesPage() {
  const [conversations, setConversations] = React.useState<VendorConversation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedConversation, setSelectedConversation] = React.useState<VendorConversation | null>(null);

  React.useEffect(() => {
    const unsubscribe = onVendorConversationsUpdate(VENDOR_ID, (updatedConversations) => {
      setConversations(updatedConversations);
      setLoading(false);

      if (selectedConversation) {
        const updatedSelected = updatedConversations.find(c => c.id === selectedConversation.id);
        setSelectedConversation(updatedSelected || null);
      } else if (updatedConversations.length > 0) {
        setSelectedConversation(updatedConversations[0]);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation]);


  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm h-[calc(100vh-10rem)] flex">
        {loading && conversations.length === 0 ? (
             <div className="h-full flex-1 flex items-center justify-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground animate-pulse" />
             </div>
        ) : (
            <>
                <div className="w-full md:w-1/3 border-r h-full overflow-y-auto">
                    <VendorConversationList
                        conversations={conversations}
                        selectedConversationId={selectedConversation?.id}
                        onSelectConversation={setSelectedConversation}
                    />
                </div>
                <div className="hidden md:flex w-2/3 h-full flex-col">
                    <VendorChatView
                        key={selectedConversation?.id}
                        conversation={selectedConversation}
                        vendorId={VENDOR_ID}
                    />
                </div>
            </>
        )}
    </div>
  );
}
