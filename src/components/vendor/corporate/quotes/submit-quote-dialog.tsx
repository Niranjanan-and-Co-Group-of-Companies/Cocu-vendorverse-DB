
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2, Download, Paperclip, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { QuoteRequest, VendorQuote } from '@/lib/quotes-service';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface SubmitQuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quoteRequest: QuoteRequest | null;
  onSubmit: (data: { finalPrice: number, estimatedCompletionDate: Date, vendorNotes: string }) => void;
}

export function SubmitQuoteDialog({ isOpen, onClose, quoteRequest, onSubmit }: SubmitQuoteDialogProps) {
  const [finalPrice, setFinalPrice] = React.useState(0);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = React.useState<Date | undefined>();
  const [vendorNotes, setVendorNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (quoteRequest?.vendorQuote?.finalPrice) {
        setFinalPrice(quoteRequest.vendorQuote.finalPrice);
    }
    if (quoteRequest?.vendorQuote?.estimatedCompletionDate) {
        setEstimatedCompletionDate(quoteRequest.vendorQuote.estimatedCompletionDate.toDate());
    } else {
        setFinalPrice(0);
        setEstimatedCompletionDate(undefined);
    }
    if (quoteRequest?.vendorQuote?.vendorNotes) {
        setVendorNotes(quoteRequest.vendorQuote.vendorNotes);
    } else {
        setVendorNotes('');
    }
  }, [quoteRequest]);
  
  if (!quoteRequest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimatedCompletionDate || finalPrice <= 0) return;
    setIsSubmitting(true);
    await onSubmit({ finalPrice, estimatedCompletionDate, vendorNotes });
    setIsSubmitting(false);
  };
  
  const isReadOnly = quoteRequest.status !== 'Pending';

  const AttachmentIcon = ({ name }: { name: string }) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
    }
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Quote Request for: {quoteRequest.productName}</DialogTitle>
          <DialogDescription>
            Quantity: {quoteRequest.quantity}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-grow overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 py-4 h-full">
                {/* Left Panel: Customer Request */}
                <div className="space-y-4 h-full flex flex-col">
                    <h4 className="font-semibold">Customer's Request</h4>
                    <div className="p-4 border rounded-md bg-muted/50 flex-grow">
                        <p className="whitespace-pre-wrap">{quoteRequest.customerNotes || "No additional notes provided."}</p>
                    </div>
                     {quoteRequest.attachments && quoteRequest.attachments.length > 0 && (
                        <div>
                            <h5 className="font-medium text-sm mb-2">Attachments</h5>
                            <div className="space-y-2">
                            {quoteRequest.attachments.map((file, i) => (
                                <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md border hover:bg-accent transition-colors">
                                    <AttachmentIcon name={file.name} />
                                    <span className="text-sm truncate flex-grow">{file.name}</span>
                                    <Download className="h-4 w-4" />
                                </a>
                            ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Your Quote */}
                <div className="space-y-4 h-full flex flex-col">
                     <h4 className="font-semibold">Your Quote</h4>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="final-price">Final Price (Total)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input id="final-price" type="number" step="0.01" value={finalPrice} onChange={e => setFinalPrice(parseFloat(e.target.value))} readOnly={isReadOnly} required className="pl-7"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Estimated Completion Date (Ship-Out Date)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isReadOnly}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {estimatedCompletionDate ? format(estimatedCompletionDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={estimatedCompletionDate} onSelect={setEstimatedCompletionDate} disabled={(date) => date < new Date() || isReadOnly} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="vendor-notes">Notes for Customer (Optional)</Label>
                            <Textarea id="vendor-notes" value={vendorNotes} onChange={e => setVendorNotes(e.target.value)} readOnly={isReadOnly} rows={3}/>
                        </div>
                    </div>
                     <div className="flex-grow" />
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Timeline Commitment</AlertTitle>
                        <AlertDescription>
                            This date is a commitment to the customer. Delays may result in financial penalties or order cancellation.
                        </AlertDescription>
                    </Alert>
                     <DialogFooter className="mt-auto pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        {!isReadOnly && (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Quote
                            </Button>
                        )}
                    </DialogFooter>
                </div>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
