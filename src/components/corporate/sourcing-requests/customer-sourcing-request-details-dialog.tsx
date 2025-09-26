
'use client';

import * as React from 'react';
import type { SourcingRequest, SourcingRequestStatus } from '@/lib/sourcing-requests-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Phone, User, Paperclip, FileText, Calendar, Wallet, Hash, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CustomerSourcingRequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: SourcingRequest | null;
}

const StatusTimeline = ({ currentStatus }: { currentStatus: SourcingRequestStatus }) => {
    const statuses: SourcingRequestStatus[] = ['New', 'In Progress', 'Sourced', 'Closed'];
    const currentIndex = statuses.indexOf(currentStatus);

    return (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
            {statuses.map((status, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isLast = index === statuses.length - 1;

                return (
                    <React.Fragment key={status}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-muted-foreground/30'}`}>
                                {isCurrent || currentIndex > index ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-3 w-3" />}
                            </div>
                            <span className={`mt-1 font-medium ${isActive ? 'text-foreground' : ''}`}>{status}</span>
                        </div>
                        {!isLast && <div className={`flex-1 h-0.5 mx-2 ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`} />}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


export function CustomerSourcingRequestDetailsDialog({ open, onOpenChange, request }: CustomerSourcingRequestDetailsDialogProps) {
  if (!request) return null;

  const getStatusInfo = (status: SourcingRequestStatus): { variant: 'default' | 'secondary' | 'destructive' | 'outline', description: string } => {
    switch (status) {
      case 'New': return { variant: 'default', description: 'Your request has been submitted and is awaiting review.' };
      case 'In Progress': return { variant: 'default', description: 'Our sourcing team is actively working on your request.' };
      case 'Sourced': return { variant: 'secondary', description: 'We have found potential products and will contact you shortly.' };
      case 'Closed': return { variant: 'outline', description: 'This request has been completed or closed.' };
      default: return { variant: 'outline', description: 'The status of this request is unknown.'};
    }
  };
  
  const statusInfo = getStatusInfo(request.status);
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Sourcing Request Details</span>
            <Badge variant={statusInfo.variant}>{request.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Request ID: <span className="font-mono">{request.id.slice(0,8)}...</span> | Submitted on: {request.createdAt?.toDate().toLocaleDateString() || 'N/A'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className="space-y-2">
                <h4 className="font-semibold text-sm">Request Progress</h4>
                <StatusTimeline currentStatus={request.status} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Your Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4"/> Product Description</h4>
                            <p className="text-muted-foreground text-sm pl-6">{request.productDescription}</p>
                        </div>
                        {request.notes && (
                            <div>
                                <h4 className="font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4"/> Additional Notes</h4>
                                <p className="text-muted-foreground text-sm pl-6">{request.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                         <CardContent className="pt-6 grid grid-cols-2 gap-4">
                             <div className="flex items-start gap-3">
                                <Hash className="h-5 w-5 text-primary"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Quantity</p>
                                    <p className="font-semibold">{request.quantity}</p>
                                </div>
                             </div>
                              <div className="flex items-start gap-3">
                                <Wallet className="h-5 w-5 text-primary"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Budget/Item</p>
                                    <p className="font-semibold">{formatCurrency(request.budget)}</p>
                                </div>
                             </div>
                              <div className="flex items-start gap-3 col-span-2">
                                <Calendar className="h-5 w-5 text-primary"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Required By</p>
                                    <p className="font-semibold">{request.requiredBy?.toDate().toLocaleDateString() || 'N/A'}</p>
                                </div>
                             </div>
                         </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                             <CardTitle className="text-base flex items-center gap-2">
                                <Paperclip className="h-5 w-5"/>
                                Your Attachments
                            </CardTitle>
                        </CardHeader>
                         <CardContent>
                            {request.attachments && request.attachments.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {request.attachments.map((file, i) => (
                                        <a href={file.url} key={i} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" className="w-full justify-start">
                                                <Download className="mr-2" /> {file.name}
                                            </Button>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No attachments were provided.</p>
                            )}
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
