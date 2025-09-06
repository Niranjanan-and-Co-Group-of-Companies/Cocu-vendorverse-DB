
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, UploadCloud, Send, X, Paperclip } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubmissionDialog } from '@/components/corporate/write-to-admin/submission-dialog';

export interface SourcingRequestData {
    productDescription: string;
    quantity: string;
    budget: string;
    requiredBy?: Date;
    notes: string;
    contactName: string;
    contactPhone: string;
    files: File[];
}


export default function WriteToAdminPage() {
    const { toast } = useToast();
    const [date, setDate] = React.useState<Date>();
    const [files, setFiles] = React.useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [formData, setFormData] = React.useState<SourcingRequestData | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        
        const existingFileNames = new Set(files.map(f => f.name));
        const uniqueNewFiles = newFiles.filter(f => !existingFileNames.has(f.name));

        if (uniqueNewFiles.length < newFiles.length) {
            toast({
                title: 'Duplicate file ignored',
                description: 'One or more of the selected files were already added.',
            });
        }

        if (files.length + uniqueNewFiles.length > 3) {
            toast({
                title: 'Upload limit reached',
                description: 'You can upload a maximum of 3 files.',
                variant: 'destructive',
            });
            return;
        }
        setFiles(prev => [...prev, ...uniqueNewFiles]);
    };

    const handleRemoveFile = (fileToRemove: File) => {
        setFiles(prev => prev.filter(file => file !== fileToRemove));
        // Reset the file input so the same file can be re-added if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElements = e.currentTarget.elements as typeof e.currentTarget.elements & {
            'product-description': { value: string };
            quantity: { value: string };
            budget: { value: string };
            'additional-notes': { value: string };
            'contact-name': { value: string };
            'contact-phone': { value: string };
        };
        
        const contactPhone = formElements['contact-phone'].value;
        if (!contactPhone) {
            toast({
                title: "Phone number required",
                description: "Please enter a contact phone number to proceed.",
                variant: "destructive"
            });
            return;
        }

        setFormData({
            productDescription: formElements['product-description'].value,
            quantity: formElements.quantity.value,
            budget: formElements.budget.value,
            notes: formElements['additional-notes'].value,
            contactName: formElements['contact-name'].value,
            contactPhone,
            files: files,
            requiredBy: date
        });

        setIsSubmitting(true);
    };

    const handleFinalSubmitSuccess = () => {
         toast({
            title: "Request Submitted",
            description: "Thank you! Our team will review your request and get back to you within 1-2 business days.",
        });
        setIsSubmitting(false);
        setFormData(null);
        setFiles([]);
        setDate(undefined);
        // Reset form fields manually if needed, for now we let the browser handle it on full page success/redirect
    }

    return (
        <>
            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Write to Admin</h1>
                    <p className="text-muted-foreground mt-2">
                        Can't find what you're looking for? Describe your requirements below, and our sourcing team will assist you.
                    </p>
                </div>

                <Alert>
                    <AlertDescription>
                        Our team will review your request and get back to you within 1-2 business days. We will do our best to source the product or find suitable alternatives to fulfill your order.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                            <CardDescription>Who should we contact regarding this request?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="contact-name">Contact Person</Label>
                                    <Input id="contact-name" placeholder="e.g., Jane Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-phone">Contact Phone</Label>
                                    <Input id="contact-phone" type="tel" placeholder="e.g., +91 98765 43210" required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Product Requirements</CardTitle>
                            <CardDescription>The more detail you provide, the better we can assist you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="product-description">Detailed Product Description</Label>
                                <Textarea id="product-description" placeholder="e.g., Black ceramic coffee mug, 11oz, with a matte finish. Must be dishwasher safe." rows={5} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Required Quantity</Label>
                                    <Input id="quantity" type="number" placeholder="e.g., 500" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget per Item (USD)</Label>
                                    <Input id="budget" type="number" placeholder="e.g., 15" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="required-by">Required By Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="additional-notes">Additional Notes or Customization Details</Label>
                                <Textarea id="additional-notes" placeholder="e.g., Need our company logo printed on one side in white. Pantone color: #FFFFFF." rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Reference Files (Optional, Max 3)</Label>
                                <Label
                                    htmlFor="reference-files"
                                    className="relative block border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                                >
                                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop or click to upload</p>
                                    <Input
                                        id="reference-files"
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={files.length >= 3}
                                    />
                                </Label>
                                {files.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <p className="text-sm font-medium">Selected files:</p>
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 text-sm rounded-md bg-muted">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Paperclip className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">{file.name}</span>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveFile(file)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button type="submit" size="lg" className="w-full">
                                <Send className="mr-2" />
                                Submit Request
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
             <SubmissionDialog 
                isOpen={isSubmitting}
                onClose={() => setIsSubmitting(false)}
                requestData={formData}
                onVerified={handleFinalSubmitSuccess}
            />
        </>
    );
}
