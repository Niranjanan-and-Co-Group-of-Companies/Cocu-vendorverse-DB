
'use client';

import * as React from 'react';
import type { ConversationSummary, Message } from '@/lib/chat-service';
import { onMessagesUpdate, updateConversationStatus } from '@/lib/chat-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Lock, ShieldAlert, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ChatViewProps {
  conversation: ConversationSummary | null;
}

export function ChatView({ conversation }: ChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (conversation) {
      setLoading(true);
      setMessages([]);
      const unsubscribe = onMessagesUpdate(conversation.id, (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [conversation]);

  React.useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleStatusChange = async (status: 'Active' | 'Locked') => {
    if (!conversation) return;
    try {
      await updateConversationStatus(conversation.id, status);
      toast({
        title: `Conversation ${status === 'Active' ? 'Approved' : 'Locked'}`,
        description: `The chat between ${conversation.participants.customer.name} and ${conversation.participants.vendor.name} is now ${status.toLowerCase()}.`
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update conversation status.', variant: 'destructive' });
    }
  };


  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium">No Conversation Selected</h3>
        <p className="text-sm">Please select a conversation from the list on the left.</p>
      </div>
    );
  }

  const getStatusVariant = (status: ConversationSummary['status']) => {
    switch (status) {
      case 'Flagged': return 'destructive';
      case 'Locked': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{conversation.participants.customer.name} &harr; {conversation.participants.vendor.name}</h3>
          <Badge variant={getStatusVariant(conversation.status)}>{conversation.status}</Badge>
        </div>
        <div className="flex gap-2">
            {conversation.status === 'Flagged' && (
                <Button variant="outline" size="sm" onClick={() => handleStatusChange('Active')}><Check className="mr-2 h-4 w-4" />Approve</Button>
            )}
             {conversation.status !== 'Locked' && (
                <Button variant="destructive" size="sm" onClick={() => handleStatusChange('Locked')}><Lock className="mr-2 h-4 w-4" />Lock</Button>
             )}
          <Button variant="secondary" size="sm"><ShieldAlert className="mr-2 h-4 w-4" />Warn</Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {loading ? (
          <div className="space-y-4">
             <div className="flex items-end gap-2 justify-start">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-48 rounded-lg" />
             </div>
             <div className="flex items-end gap-2 justify-end">
                <Skeleton className="h-20 w-64 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-full" />
             </div>
             <div className="flex items-end gap-2 justify-start">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-32 rounded-lg" />
             </div>
          </div>
        ) : (
          messages.map(msg => (
            <ChatMessage
              key={msg.id}
              message={msg}
              customer={conversation.participants.customer}
              vendor={conversation.participants.vendor}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
