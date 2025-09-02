
'use client';

import * as React from 'react';
import type { ConversationSummary } from '@/lib/chat-service';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatConversationItem } from './chat-conversation-item';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatConversationListProps {
  conversations: ConversationSummary[];
  loading: boolean;
  selectedConversationId?: string | null;
  onSelectConversation: (conversation: ConversationSummary) => void;
}

export function ChatConversationList({
  conversations,
  loading,
  selectedConversationId,
  onSelectConversation,
}: ChatConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('All');

  const filteredConversations = React.useMemo(() => {
    let filtered = [...conversations];

    if (activeTab !== 'All') {
      const filterType = activeTab === 'Personalised' ? 'Customer' : activeTab;
      filtered = filtered.filter(c => c.type === filterType);
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.participants.customer.name.toLowerCase().includes(lowerCaseQuery) ||
        c.participants.vendor.name.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return filtered;
  }, [conversations, activeTab, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Conversations</h2>
        <p className="text-sm text-muted-foreground">Monitor and manage all chats.</p>
      </div>
      <div className="p-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="All" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="Personalised" className="flex-1">Personalised</TabsTrigger>
            <TabsTrigger value="Corporate" className="flex-1">Corporate</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        {loading ? (
          <div className="p-3 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
          </div>
        ) : (
          filteredConversations.map(conv => (
            <ChatConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedConversationId}
              onSelect={() => onSelectConversation(conv)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
