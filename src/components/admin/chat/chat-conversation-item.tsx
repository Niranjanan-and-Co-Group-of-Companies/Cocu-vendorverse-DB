
'use client';

import * as React from 'react';
import type { ConversationSummary } from '@/lib/chat-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatConversationItemProps {
  conversation: ConversationSummary;
  isSelected: boolean;
  onSelect: () => void;
}

export function ChatConversationItem({ conversation, isSelected, onSelect }: ChatConversationItemProps) {

  const getStatusVariant = (status: ConversationSummary['status']) => {
    switch (status) {
      case 'Flagged': return 'destructive';
      case 'Locked': return 'secondary';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } catch (e) {
      return '';
    }
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-3 cursor-pointer border-b",
        isSelected ? "bg-accent" : "hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={conversation.participants.customer.avatar} alt={conversation.participants.customer.name} />
          <AvatarFallback>{conversation.participants.customer.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <Avatar className="absolute -bottom-2 -right-2 h-6 w-6 border-2 border-background">
          <AvatarImage src={conversation.participants.vendor.avatar} alt={conversation.participants.vendor.name} />
          <AvatarFallback>{conversation.participants.vendor.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-start">
          <p className="font-semibold truncate">
            {conversation.participants.customer.name} / {conversation.participants.vendor.name}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp(conversation.lastMessage.timestamp)}
          </span>
        </div>
        <div className="flex justify-between items-end">
            <p className="text-sm text-muted-foreground truncate pr-2">
                {conversation.lastMessage.text}
            </p>
            <div className="flex gap-1 items-center">
                 {conversation.status !== 'Active' && (
                    <Badge variant={getStatusVariant(conversation.status)} className="text-xs">{conversation.status}</Badge>
                 )}
                 {conversation.unreadCount > 0 && (
                    <Badge className="h-5 w-5 flex items-center justify-center p-0">{conversation.unreadCount}</Badge>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
}
