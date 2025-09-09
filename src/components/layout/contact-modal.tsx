
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
        setIsSending(false);
        onOpenChange(false);
        toast({
            title: "Message Sent!",
            description: "Thanks for reaching out. We'll get back to you shortly.",
        });
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            Have a question or feedback? Fill out the form below to get in touch with our team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your Name" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="How can we help?" required />
            </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>Cancel</Button>
                <Button type="submit" disabled={isSending}>
                    {isSending && <Loader2 className="mr-2 animate-spin" />}
                    Send Message
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
