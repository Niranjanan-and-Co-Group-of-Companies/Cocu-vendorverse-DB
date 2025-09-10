
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { createSupportTicket, type TicketCategory, type TicketPriority } from '@/lib/vendor/support-service';
import { Loader2, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
}

const TICKET_CATEGORIES: TicketCategory[] = [
  'Payouts & Finance',
  'Orders & Cancellations',
  'NDR/RTO',
  'Product Listing/Approval',
  'Customization Studio',
  'KYC & Verification',
  'Logistics & Labels',
  'Technical Issue',
  'Policy & Compliance',
  'Feature Request'
];

export function CreateTicketDialog({ open, onOpenChange, vendorId }: CreateTicketDialogProps) {
  const [category, setCategory] = React.useState<TicketCategory | ''>('');
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<TicketPriority>('Normal');
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setCategory('');
    setSubject('');
    setDescription('');
    setPriority('Normal');
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (!category || !subject || !description) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    try {
      await createSupportTicket({
        vendorId,
        category,
        subject,
        description,
        priority,
        status: 'Open',
        attachments: [],
      });
      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been submitted. We will get back to you shortly.',
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast({
        title: 'Error',
        description: 'Could not create your ticket. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Open a New Support Ticket</DialogTitle>
          <DialogDescription>
            Provide as much detail as possible so we can assist you quickly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as TicketCategory)}>
              <SelectTrigger id="category" className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {TICKET_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Payout for Order #12345 is missing"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={5}
              placeholder="Please describe the issue in detail..."
            />
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Attachments
            </Label>
            <div className="col-span-3">
                <div className="w-full aspect-video rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center text-muted-foreground">
                        <UploadCloud className="mx-auto h-8 w-8" />
                        <p className="mt-2 text-sm">Click to upload files</p>
                        <p className="text-xs">Screenshots, PDFs, etc.</p>
                    </div>
                </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={(value) => setPriority(value as TicketPriority)}
              className="col-span-3 flex items-center gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Urgent" id="urgent" />
                <Label htmlFor="urgent">Urgent</Label>
              </div>
            </RadioGroup>
          </div>
            <Alert variant="destructive">
                <AlertDescription>
                    This is not a real-time chat. For urgent issues that are blocking orders, please use the live chat option when available. Support tickets and their chat history will be automatically deleted after 10 days of being marked as 'Resolved'.
                </AlertDescription>
            </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
