
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Flag, Send, Lock } from 'lucide-react';
import type { VendorConversation, Message } from '@/lib/vendor/messages-service';
import { onMessagesUpdate, sendMessage, updateConversationStatus } from '@/lib/vendor/messages-service';
import { VendorChatMessage } from './vendor-chat-message';
import { Badge } from '@/components/ui/badge';

interface VendorChatViewProps {
  conversation: VendorConversation | null;
  vendorId: string;
}

const MAX_CHAR_LIMIT = 30;

export function VendorChatView({ conversation, vendorId }: VendorChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isEndingChat, setIsEndingChat] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (conversation) {
      setLoading(true);
      setMessages([]);
      const unsubscribe = onMessagesUpdate(conversation.id, (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        setTimeout(() => scrollToBottom(), 100);
      });
      return () => unsubscribe();
    }
  }, [conversation]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || conversation.messageCount >= 4) return;

    try {
      await sendMessage(conversation.id, vendorId, 'vendor', newMessage);
      setNewMessage('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
  };
  
  const handleEndChat = async () => {
    if (!conversation) return;
    try {
        await updateConversationStatus(conversation.id, 'Locked');
        toast({ title: 'Chat Ended', description: 'This conversation has been locked.' });
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to end chat.', variant: 'destructive' });
    }
    setIsEndingChat(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Remove any numbers from the input value
    const valueWithoutNumbers = e.target.value.replace(/[0-9]/g, '');
    setNewMessage(valueWithoutNumbers);
  };


  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium">No Conversation Selected</h3>
        <p className="text-sm">Please select a conversation from the list.</p>
      </div>
    );
  }
  
  const messagesRemaining = Math.max(0, 4 - (conversation.messageCount || 0));
  const canSendMessage = messagesRemaining > 0 && conversation.status === 'Active';

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{conversation.product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
                <Badge variant={conversation.status === 'Locked' ? 'secondary' : 'default'}>{conversation.status}</Badge>
                <Badge variant="outline">{messagesRemaining} messages left</Badge>
            </div>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" size="sm"><Flag className="mr-2 h-4 w-4" />Flag for Admin</Button>
              <Button variant="destructive-outline" size="sm" onClick={() => setIsEndingChat(true)} disabled={conversation.status === 'Locked'}>
                <Lock className="mr-2 h-4 w-4" /> End Chat
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="space-y-4">
               <div className="flex items-end gap-2 justify-start"><Skeleton className="h-16 w-48 rounded-lg" /></div>
               <div className="flex items-end gap-2 justify-end"><Skeleton className="h-20 w-64 rounded-lg" /></div>
               <div className="flex items-end gap-2 justify-start"><Skeleton className="h-12 w-32 rounded-lg" /></div>
            </div>
          ) : (
            messages.map(msg => (
              <VendorChatMessage
                key={msg.id}
                message={msg}
                vendorId={vendorId}
              />
            ))
          )}
        </ScrollArea>
        
        {/* Input Form */}
        <div className="p-4 border-t">
          {canSendMessage ? (
              <div className="space-y-2">
                <form onSubmit={handleSendMessage} className="flex items-start gap-2">
                    <Textarea
                    ref={textAreaRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-grow resize-none"
                    rows={2}
                    maxLength={MAX_CHAR_LIMIT}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                        }
                    }}
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                    </Button>
                </form>
                <p className="text-xs text-muted-foreground text-right">
                    {newMessage.length} / {MAX_CHAR_LIMIT}
                </p>
              </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-3 bg-muted rounded-md">
                {conversation.status === 'Locked' ? "This chat has been ended." : "Message limit reached."}
            </div>
          )}
        </div>
      </div>
      <AlertDialog open={isEndingChat} onOpenChange={setIsEndingChat}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to end this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will lock the conversation and prevent any further messages from being sent by either party. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndChat} className="bg-destructive hover:bg-destructive/90">End Chat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
