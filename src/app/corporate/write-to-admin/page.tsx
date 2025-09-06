
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, UploadCloud, Send } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WriteToAdminPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Request Submitted",
            description: "Thank you! Our team will review your request and get back to you within 1-2 business days.",
        });
        // Here you would typically handle form data submission to a backend service.
    };

    return (
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
                                        className={cn("w-full justify-start text-left font-normal", !true && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        <span>Pick a date</span>
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="additional-notes">Additional Notes or Customization Details</Label>
                            <Textarea id="additional-notes" placeholder="e.g., Need our company logo printed on one side in white. Pantone color: #FFFFFF." rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reference-files">Reference Files (Optional)</Label>
                             <div className="relative border-2 border-dashed border-muted rounded-lg p-6 text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Drag & drop or click to upload</p>
                                <Input id="reference-files" type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                        </div>
                         <Button type="submit" size="lg" className="w-full">
                            <Send className="mr-2" />
                            Submit Request
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
