
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { onQuoteRequestsUpdate, type QuoteRequest } from '@/lib/quotes-service';
import { submitVendorQuote } from '@/lib/quotes-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { SubmitQuoteDialog } from '@/components/vendor/corporate/quotes/submit-quote-dialog';
import { getProductById, type Product } from '@/lib/products-service';

const VENDOR_ID = 'vendor003';

type QuoteRequestWithProduct = QuoteRequest & { product?: Pick<Product, 'id' | 'category'>};

function QuoteTable({ requests, isLoading, onSelectRequest }: { requests: QuoteRequest[], isLoading: boolean, onSelectRequest: (req: QuoteRequest) => void }) {
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? Array.from({length: 3}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10 rounded-md" /><Skeleton className="h-4 w-32" /></div></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
                            </TableRow>
                        )) : requests.length > 0 ? requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 rounded-md">
                                            <AvatarImage src={req.productImage} alt={req.productName} />
                                            <AvatarFallback>{req.productName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{req.productName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{req.customerName}</TableCell>
                                <TableCell>{req.quantity}</TableCell>
                                <TableCell><Badge variant={req.status === 'Pending' ? 'default' : 'secondary'}>{req.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant={req.status === 'Pending' ? 'default' : 'outline'} onClick={() => onSelectRequest(req)}>
                                        {req.status === 'Pending' ? 'Submit Quote' : 'View Details'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                           <TableRow>
                               <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                   No quote requests found.
                               </TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function VendorQuotesPage() {
    const [quoteRequests, setQuoteRequests] = React.useState<QuoteRequest[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedRequest, setSelectedRequest] = React.useState<QuoteRequestWithProduct | null>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        const unsubscribe = onQuoteRequestsUpdate(VENDOR_ID, (requests) => {
            setQuoteRequests(requests);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSelectRequest = async (request: QuoteRequest) => {
        const product = await getProductById(request.productId);
        if(product) {
            setSelectedRequest({ ...request, product: { id: product.id, category: product.category } });
        } else {
            toast({title: "Error", description: "Could not find the associated product.", variant: 'destructive'});
        }
    }

    const handleQuoteSubmit = async (quoteData: { finalPrice: number, estimatedCompletionDate: Date, vendorNotes: string, product: Pick<Product, 'id' | 'category'> }) => {
        if (!selectedRequest) return;
        try {
            await submitVendorQuote(selectedRequest.id, quoteData);
            toast({ title: "Quote Submitted", description: "Your quote has been sent to the customer." });
            setSelectedRequest(null);
        } catch (error) {
            console.error("Failed to submit quote:", error);
            toast({ title: "Error", description: "Could not submit your quote.", variant: 'destructive' });
        }
    }
    
    const activeRequests = quoteRequests.filter(q => q.status === 'Pending');
    const pastRequests = quoteRequests.filter(q => q.status !== 'Pending');

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-bold">Manage Quotes</h1>
                <p className="text-muted-foreground">Respond to direct quote requests from corporate customers.</p>
            </div>
            <Tabs defaultValue="active" className="w-full">
                <TabsList>
                    <TabsTrigger value="active">Active Requests</TabsTrigger>
                    <TabsTrigger value="past">Past Quotes</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-4">
                    <QuoteTable requests={activeRequests} isLoading={loading} onSelectRequest={handleSelectRequest} />
                </TabsContent>
                <TabsContent value="past" className="mt-4">
                     <QuoteTable requests={pastRequests} isLoading={loading} onSelectRequest={handleSelectRequest} />
                </TabsContent>
            </Tabs>
            
            <SubmitQuoteDialog
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                quoteRequest={selectedRequest}
                onSubmit={handleQuoteSubmit}
            />
        </div>
    );
}
