
'use client';

import * as React from 'react';
import type { VendorConversation } from '@/lib/vendor/messages-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface VendorConversationItemProps {
  conversation: VendorConversation;
  isSelected: boolean;
  onSelect: () => void;
}

export function VendorConversationItem({ conversation, isSelected, onSelect }: VendorConversationItemProps) {

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
        <p className="text-sm text-muted-foreground truncate pr-2">
            {conversation.lastMessage.text}
        </p>
        <div className="flex justify-between items-end mt-1">
             <Badge variant={conversation.status === 'Locked' ? 'secondary' : 'default'} className="text-xs">{conversation.status}</Badge>
             <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimestamp(conversation.lastMessage.timestamp)}
             </span>
        </div>
      </div>
    </div>
  );
}
