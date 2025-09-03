
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  isCustomer: boolean;
  message: {
    text: string;
    timestamp?: any;
  }
}

export function ChatMessage({ isCustomer, message }: ChatMessageProps) {
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    return formatDistanceToNow(new Date(), { addSuffix: true });
  };
  
  return (
    <div
      className={cn(
        'flex items-end gap-2 my-2 max-w-[80%]',
        isCustomer ? 'justify-start self-start' : 'justify-end self-end'
      )}
    >
      <div
        className={cn(
          'p-3 rounded-lg',
          isCustomer
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={cn(
            "text-xs mt-1 text-right",
            isCustomer ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
            {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
