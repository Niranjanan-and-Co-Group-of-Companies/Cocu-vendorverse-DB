
'use client';

import * as React from 'react';
import type { Message, UserInfo } from '@/lib/chat-service';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  customer: UserInfo;
  vendor: UserInfo;
}

export function ChatMessage({ message, customer, vendor }: ChatMessageProps) {

  const isCustomer = message.senderType === 'customer';
  const isVendor = message.senderType === 'vendor';
  const isSystem = message.senderType === 'system';

  const sender = isCustomer ? customer : vendor;

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
  };
  
  if (isSystem) {
    return (
        <div className="text-center text-xs text-muted-foreground my-4">
            <p>{message.text} - {formatTimestamp(message.timestamp)}</p>
        </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-end gap-2 my-2',
        isCustomer ? 'justify-start' : 'justify-end'
      )}
    >
      {isCustomer && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'p-3 rounded-lg max-w-sm',
          isCustomer
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground'
        )}
      >
        <p className="text-sm">{message.text}</p>
        <p className={cn(
            "text-xs mt-1",
            isCustomer ? "text-muted-foreground" : "text-primary-foreground/70"
        )}>
            {formatTimestamp(message.timestamp)}
        </p>
      </div>
      {isVendor && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
