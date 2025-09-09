
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
        toast({ title: 'All fields are required', variant: 'destructive'});
        return;
    }

    setIsSending(true);
    try {
        await addDoc(collection(db, 'contactSubmissions'), {
            name,
            email,
            message,
            createdAt: serverTimestamp(),
            status: 'New',
        });
        setIsSending(false);
        onOpenChange(false);
        formRef.current.reset();
        toast({
            title: "Message Sent!",
            description: "Thanks for reaching out. We'll get back to you shortly.",
        });
    } catch (error) {
        console.error("Failed to submit contact form:", error);
        setIsSending(false);
        toast({ title: 'Error', description: 'Could not send your message. Please try again.', variant: 'destructive'});
    }
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
        <form onSubmit={handleSubmit} ref={formRef}>
            <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Your Name" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="How can we help?" required />
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
