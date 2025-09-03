
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
import { MessageSquare, AlertTriangle, Send, Paperclip, Loader2 } from 'lucide-react';
import type { Conversation } from '@/hooks/use-corporate-chat-store';
import { ChatMessage } from './chat-message';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatViewProps {
  conversation: Conversation | null;
}

export function ChatView({ conversation }: ChatViewProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const [isReporting, setIsReporting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        toast({ title: "Attachment added", description: file.name });
        setIsUploading(false);
      }, 1500);
    }
  }


  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium">Select a Conversation</h3>
        <p className="text-sm">Choose a conversation from the list to see the messages.</p>
      </div>
    );
  }
  
  const messagesRemaining = 12 - (conversation.messageCount || 0);
  const canSendMessage = messagesRemaining > 0 && conversation.status === 'Active';
  const canAttachFile = conversation.attachmentsCount < 3;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage src={conversation.product.image} alt={conversation.product.name} />
                    <AvatarFallback>{conversation.product.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                     <h3 className="font-semibold">{conversation.product.name}</h3>
                     <p className="text-sm text-muted-foreground">with {conversation.vendor.name}</p>
                </div>
            </div>
          <div className="flex items-center gap-2">
              <Badge variant="outline">Remaining: {messagesRemaining}/12</Badge>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setIsReporting(true)}>
                            <AlertTriangle className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Report Conversation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-grow p-4">
            {/* Placeholder messages */}
            <ChatMessage isCustomer={true} message={{ text: 'Hi, I have a question about this product.' }} />
            <ChatMessage isCustomer={false} message={{ text: 'I am happy to help! What would you like to know?' }} />
        </ScrollArea>
        
        {/* Input Form */}
        <div className="p-4 border-t bg-background">
          {canSendMessage ? (
              <div className="space-y-2">
                <form onSubmit={handleSendMessage} className="flex items-start gap-2">
                    <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        }
                    }}
                    />
                     <Button type="button" variant="ghost" size="icon" disabled={!canAttachFile || isUploading} onClick={() => fileInputRef.current?.click()}>
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                     </Button>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <Button type="submit" disabled={!newMessage.trim() || isUploading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
              </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-3 bg-muted rounded-md">
                {conversation.status === 'Locked' ? "This chat has been ended." : "Message limit reached."}
            </div>
          )}
        </div>
      </div>
      <AlertDialog open={isReporting} onOpenChange={setIsReporting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for reporting this chat. This will be sent to the platform administrators for review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
             <Textarea placeholder="Reason for reporting..." />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast({title: "Chat Reported", description: "Thank you for your feedback. An admin will review this shortly."})}>Submit Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
