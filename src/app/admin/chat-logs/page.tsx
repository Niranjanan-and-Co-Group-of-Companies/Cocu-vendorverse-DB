
'use client';

import * as React from 'react';
import { onConversationsUpdate, type ConversationSummary } from '@/lib/chat-service';
import { ChatConversationList } from '@/components/admin/chat/chat-conversation-list';
import { ChatView } from '@/components/admin/chat/chat-view';

export default function ChatLogsPage() {
  const [conversations, setConversations] = React.useState<ConversationSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedConversation, setSelectedConversation] = React.useState<ConversationSummary | null>(null);

  React.useEffect(() => {
    const unsubscribe = onConversationsUpdate((updatedConversations) => {
      setConversations(updatedConversations);
      setLoading(false);

      // If there's a selected conversation, update its details from the new list
      if (selectedConversation) {
        const updatedSelected = updatedConversations.find(c => c.id === selectedConversation.id);
        setSelectedConversation(updatedSelected || null);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Left Panel: Conversation List */}
      <div className="w-1/3 border-r h-full">
        <ChatConversationList
          conversations={conversations}
          loading={loading}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={setSelectedConversation}
        />
      </div>

      {/* Right Panel: Chat View */}
      <div className="w-2/3 h-full">
        <ChatView conversation={selectedConversation} />
      </div>
    </div>
  );
}
