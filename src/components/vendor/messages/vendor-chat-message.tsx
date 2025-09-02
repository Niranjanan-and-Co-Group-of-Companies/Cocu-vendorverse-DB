
'use client';

import * as React from 'react';
import type { Message } from '@/lib/vendor/messages-service';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface VendorChatMessageProps {
  message: Message;
  vendorId: string;
}

export function VendorChatMessage({ message, vendorId }: VendorChatMessageProps) {
  const isVendor = message.senderId === vendorId;
  const isCustomer = message.senderType === 'customer';
  const isSystem = message.senderType === 'system';

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
        'flex items-end gap-2 my-2 max-w-[80%]',
        isCustomer ? 'justify-start self-start' : 'justify-end self-end'
      )}
    >
      <div
        className={cn(
          'p-3 rounded-lg',
          isCustomer
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={cn(
            "text-xs mt-1 text-right",
            isCustomer ? "text-muted-foreground" : "text-primary-foreground/70"
        )}>
            {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
