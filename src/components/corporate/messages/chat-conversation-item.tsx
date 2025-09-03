
'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/hooks/use-corporate-chat-store';
import { formatDistanceToNow } from 'date-fns';

interface ChatConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}

export function ChatConversationItem({ conversation, isSelected, onSelect }: ChatConversationItemProps) {

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      // Assuming it might be a Firestore Timestamp
      if(timestamp.toDate) {
          return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
      }
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
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
      <Avatar className="h-12 w-12 rounded-md">
        <AvatarImage src={conversation.product.image} alt={conversation.product.name} />
        <AvatarFallback>{conversation.product.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-start">
          <p className="font-semibold truncate pr-2">
            {conversation.product.name}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge className="h-5 w-5 flex items-center justify-center p-0">{conversation.unreadCount}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
            {conversation.vendor.name}
        </p>
        <p className="text-sm text-muted-foreground truncate pr-2">
            {conversation.lastMessage.text}
        </p>
      </div>
    </div>
  );
}
