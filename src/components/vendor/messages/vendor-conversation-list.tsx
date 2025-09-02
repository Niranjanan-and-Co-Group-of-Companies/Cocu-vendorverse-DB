
'use client';

import * as React from 'react';
import type { VendorConversation } from '@/lib/vendor/messages-service';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VendorConversationItem } from './vendor-conversation-item';
import { markConversationAsRead } from '@/lib/vendor/messages-service';

interface VendorConversationListProps {
  conversations: VendorConversation[];
  selectedConversationId?: string | null;
  onSelectConversation: (conversation: VendorConversation) => void;
}

export function VendorConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: VendorConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery) return conversations;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.product.name.toLowerCase().includes(lowerCaseQuery)
    );
  }, [conversations, searchQuery]);

  const handleSelect = (conversation: VendorConversation) => {
    onSelectConversation(conversation);
    if (conversation.unreadCount > 0) {
        markConversationAsRead(conversation.id);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Inbox</h2>
        <p className="text-sm text-muted-foreground">All customer messages.</p>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
                <VendorConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={conv.id === selectedConversationId}
                    onSelect={() => handleSelect(conv)}
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
