
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LifeBuoy,
} from 'lucide-react';
import type { SupportTicket, KnowledgeBaseArticle } from '@/lib/vendor/support-service';
import { getPopularArticles } from '@/lib/vendor/support-service';
import { onAllVendorTicketsUpdate } from '@/lib/vendor/support-client-service';
import { CreateTicketDialog } from '@/components/vendor/support/create-ticket-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SupportTicketDetailsDialog } from '@/components/admin/support/support-ticket-details-dialog';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface VendorSupportPageContentProps {
    vendorId: string;
}

function VendorSupportPageContent({ vendorId }: VendorSupportPageContentProps) {
  const searchParams = useSearchParams();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = React.useState(false);
  const [allTickets, setAllTickets] = React.useState<SupportTicket[]>([]);
  const [popularArticles, setPopularArticles] = React.useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);

  React.useEffect(() => {
    const unsub = onAllVendorTicketsUpdate(vendorId, (tickets) => {
      setAllTickets(tickets);
      setLoading(false);
    });

    getPopularArticles().then(setPopularArticles);

    return () => unsub();
  }, [vendorId]);

  React.useEffect(() => {
    const ticketIdFromUrl = searchParams.get('ticketId');
    if (ticketIdFromUrl) {
      const getTicket = async () => {
        const ticketRef = doc(db, 'supportTickets', ticketIdFromUrl);
        const ticketSnap = await getDoc(ticketRef);
        if (ticketSnap.exists()) {
          setSelectedTicket({ id: ticketSnap.id, ...ticketSnap.data() } as SupportTicket);
        }
      }
      getTicket();
    }
  }, [searchParams]);
  
  const getStatusVariant = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open':
      case 'In Progress':
        return 'default';
      case 'Waiting on Vendor':
        return 'secondary';
      case 'Resolved':
        return 'outline';
      default:
        return 'default';
    }
  };


  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">How can we help?</h1>
          <p className="mt-2 text-muted-foreground">
            Find answers in our knowledge base or create a support ticket.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="max-w-lg mx-auto w-full">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <LifeBuoy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Open a Support Ticket</CardTitle>
              </div>
              <CardDescription className="pt-2">
                For detailed issues, tracking, and formal requests. Best for payment issues, policy questions, or technical problems.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button onClick={() => setIsTicketDialogOpen(true)} className="w-full md:w-auto">Create a Ticket</Button>
            </CardContent>
          </Card>
        </div>

        {/* All Tickets and Popular Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Your Ticket History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : allTickets.length > 0 ? (
                      allTickets.map(ticket => (
                        <TableRow key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="cursor-pointer">
                          <TableCell className="font-mono text-xs">{ticket.ticketId}</TableCell>
                          <TableCell className="font-medium">{ticket.subject}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(ticket.lastUpdated.toDate(), { addSuffix: true })}</TableCell>
                          <TableCell><Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge></TableCell>
                        </TableRow>
                      ))
                    ) : (
                       <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            You haven't created any tickets yet.
                          </TableCell>
                       </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Popular Articles</CardTitle>
            </CardHeader>
            <CardContent>
                {popularArticles.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {popularArticles.map(article => (
                            <AccordionItem value={article.id} key={article.id}>
                                <AccordionTrigger>{article.title}</AccordionTrigger>
                                <AccordionContent>
                                    {article.content}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No articles found.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateTicketDialog
        open={isTicketDialogOpen}
        onOpenChange={setIsTicketDialogOpen}
        vendorId={vendorId}
      />
       <SupportTicketDetailsDialog 
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
        userType="vendor"
      />
    </>
  );
}

export default function VendorSupportPage({ vendorId = 'vendor002' }: { vendorId?: string }) {
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <VendorSupportPageContent vendorId={vendorId} />
        </React.Suspense>
    );
}
