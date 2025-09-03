
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation } from '@/hooks/use-corporate-chat-store';
import { ChatConversationItem } from './chat-conversation-item';

interface ChatConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ChatConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ChatConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery) return conversations;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.product.name.toLowerCase().includes(lowerCaseQuery) ||
      c.vendor.name.toLowerCase().includes(lowerCaseQuery)
    );
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Conversations</h2>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product or vendor..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
                <ChatConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={conv.id === selectedConversationId}
                    onSelect={() => onSelectConversation(conv)}
                />
          ))
        ) : (
            <div className="text-center text-muted-foreground p-8">
                <p>No conversations found.</p>
            </div>
        )}
      </ScrollArea>
    </div>
  );
}
