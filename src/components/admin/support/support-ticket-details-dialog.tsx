
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
import type { SupportTicket, SupportTicketMessage, TicketStatus } from '@/lib/vendor/support-service';
import { sendAdminSupportMessage, updateSupportTicketStatus } from '@/lib/admin/support-service';
import { sendVendorSupportMessage, markConversationAsReadByVendor } from '@/lib/vendor/support-service';
import { onMessagesUpdate } from '@/lib/admin/support-client-service';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SupportTicketDetailsDialogProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onOpenChange: () => void;
  userType: 'admin' | 'vendor';
}

const TICKET_STATUS_OPTIONS: TicketStatus[] = ['Open', 'In Progress', 'Waiting on Vendor', 'Resolved'];

export function SupportTicketDetailsDialog({ ticket, isOpen, onOpenChange, userType }: SupportTicketDetailsDialogProps) {
  const [messages, setMessages] = React.useState<SupportTicketMessage[]>([]);
  const [replyText, setReplyText] = React.useState('');
  const [currentStatus, setCurrentStatus] = React.useState<TicketStatus | undefined>(undefined);
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ticket && isOpen) {
      setCurrentStatus(ticket.status);
      const unsubscribe = onMessagesUpdate(ticket.id, (newMessages) => {
        setMessages(newMessages);
      });

      if (userType === 'vendor' && ticket.isReadByVendor === false) {
        markConversationAsReadByVendor(ticket.id);
      }

      return () => unsubscribe();
    }
  }, [ticket, isOpen, userType]);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
             setTimeout(() => viewport.scrollTop = viewport.scrollHeight, 100);
        }
    }
  }, [messages]);
  
  const handleStatusUpdate = async () => {
      if(!ticket || !currentStatus || currentStatus === ticket.status) return;

      setIsSending(true);
      try {
          await updateSupportTicketStatus(ticket.id, currentStatus);
          toast({ title: "Status Updated", description: `Ticket status set to "${currentStatus}".`});
          // Optimistic update in UI
          if (ticket) ticket.status = currentStatus;
      } catch (error) {
          toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
      } finally {
          setIsSending(false);
      }
  }

  const handleSendReply = async () => {
    if (!ticket || !replyText.trim()) return;

    setIsSending(true);
    try {
      if (userType === 'admin') {
        await sendAdminSupportMessage(ticket, replyText);
        setCurrentStatus('Waiting on Vendor');
      } else {
        await sendVendorSupportMessage(ticket, replyText);
        setCurrentStatus('In Progress');
      }
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
          <DialogTitle>{ticket?.subject}</DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span className="font-mono bg-muted px-2 py-1 rounded-md">{ticket?.ticketId}</span>
            <Badge variant={getStatusVariant(ticket?.status || 'Open')}>{ticket?.status}</Badge>
            <Badge variant={getPriorityVariant(ticket?.priority || 'Normal')}>{ticket?.priority}</Badge>
          </div>
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
                    msg.senderType === userType
                      ? 'bg-primary text-primary-foreground self-end ml-auto'
                      : 'bg-muted self-start mr-auto'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={cn(
                      "text-xs mt-1",
                      msg.senderType === userType ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {format(msg.timestamp.toDate(), 'PP p')}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator className="my-4" />

            {userType === 'admin' && (
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <Label htmlFor="status-select">Ticket Status</Label>
                        <Select value={currentStatus} onValueChange={(value) => setCurrentStatus(value as TicketStatus)}>
                            <SelectTrigger id="status-select">
                                <SelectValue placeholder="Change status..." />
                            </SelectTrigger>
                            <SelectContent>
                                {TICKET_STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-end">
                        <Button
                            variant="secondary"
                            onClick={handleStatusUpdate}
                            disabled={isSending || currentStatus === ticket?.status}
                            className="w-full"
                        >
                             {isSending ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Update Status Only
                        </Button>
                    </div>
                </div>
            )}

          <div className="space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              disabled={isSending || ticket?.status === 'Resolved'}
            />
            <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon" disabled>
                    <Paperclip className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendReply} disabled={isSending || !replyText.trim() || ticket?.status === 'Resolved'}>
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
