
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, Paperclip, Send } from 'lucide-react';
import type { SupportTicket, SupportTicketMessage } from '@/lib/vendor/support-service';
import { sendAdminSupportMessage } from '@/lib/admin/support-service';
import { onMessagesUpdate } from '@/lib/admin/support-client-service';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SupportTicketDetailsDialogProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onOpenChange: () => void;
}

export function SupportTicketDetailsDialog({ ticket, isOpen, onOpenChange }: SupportTicketDetailsDialogProps) {
  const [messages, setMessages] = React.useState<SupportTicketMessage[]>([]);
  const [replyText, setReplyText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ticket && isOpen) {
      const unsubscribe = onMessagesUpdate(ticket.id, (newMessages) => {
        setMessages(newMessages);
      });
      return () => unsubscribe();
    }
  }, [ticket, isOpen]);

  React.useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
        scrollAreaRef.current.children[1].scrollTop = scrollAreaRef.current.children[1].scrollHeight;
    }
  }, [messages]);

  const handleSendReply = async () => {
    if (!ticket || !replyText.trim()) return;

    setIsSending(true);
    try {
      await sendAdminSupportMessage(ticket, replyText);
      setReplyText('');
      toast({ title: 'Reply Sent' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send reply.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusVariant = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open': return 'default';
      case 'In Progress': return 'secondary';
      case 'Waiting on Vendor': return 'outline';
      case 'Resolved': return 'outline';
      default: return 'default';
    }
  };
  
  const getPriorityVariant = (priority: SupportTicket['priority']) => {
    return priority === 'Urgent' ? 'destructive' : 'secondary';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ticket: {ticket?.subject}</DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>#{ticket?.id.slice(0, 8)}...</span>
            <Badge variant={getStatusVariant(ticket?.status || 'Open')}>{ticket?.status}</Badge>
            <Badge variant={getPriorityVariant(ticket?.priority || 'Normal')}>{ticket?.priority}</Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden flex flex-col">
          <ScrollArea className="flex-grow" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
              <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold text-sm">Original Message from {ticket?.vendorId}</p>
                  <p className="whitespace-pre-wrap mt-1">{ticket?.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{ticket?.createdAt.toDate().toLocaleString()}</p>
              </div>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'p-3 rounded-lg max-w-[80%]',
                    msg.senderType === 'admin'
                      ? 'bg-primary text-primary-foreground self-end ml-auto'
                      : 'bg-muted self-start mr-auto'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={cn(
                      "text-xs mt-1",
                      msg.senderType === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {format(msg.timestamp.toDate(), 'PP p')}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              disabled={isSending}
            />
            <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon" disabled>
                    <Paperclip className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendReply} disabled={isSending || !replyText.trim()}>
                    {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reply
                </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
