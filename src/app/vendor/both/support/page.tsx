

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Book,
  MessageSquare,
  LifeBuoy,
  ChevronRight,
} from 'lucide-react';
import type { SupportTicket, KnowledgeBaseArticle } from '@/lib/vendor/support-service';
import { getPopularArticles } from '@/lib/vendor/support-service';
import { CreateTicketDialog } from '@/components/vendor/support/create-ticket-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { collection, onSnapshot, query, where, orderBy, limit, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// In a real app, this would come from an auth context
const VENDOR_ID = 'vendor001';

// This function is defined here to be used as a client-side listener
function onRecentTicketsUpdate(vendorId: string, callback: (tickets: SupportTicket[]) => void): Unsubscribe {
  const ticketsRef = collection(db, 'supportTickets');
  const q = query(
    ticketsRef,
    where('vendorId', '==', vendorId),
    orderBy('lastUpdated', 'desc'),
    limit(3)
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicket));
    callback(tickets);
  });
}


export default function VendorSupportPage() {
  const [isTicketDialogOpen, setIsTicketDialogOpen] = React.useState(false);
  const [recentTickets, setRecentTickets] = React.useState<SupportTicket[]>([]);
  const [popularArticles, setPopularArticles] = React.useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onRecentTicketsUpdate(VENDOR_ID, (tickets) => {
      setRecentTickets(tickets);
      setLoading(false);
    });

    getPopularArticles().then(setPopularArticles);

    return () => unsub();
  }, []);
  
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
            Find answers, create support tickets, or chat with our team.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Message Support</CardTitle>
              </div>
               <CardDescription className="pt-2">
                For quick questions and clarifications. Get fast help for non-critical issues. Chat history is deleted after 10 days.
              </CardDescription>
            </CardHeader>
             <CardContent className="flex-grow flex items-end">
              <Button variant="secondary" className="w-full md:w-auto">Start a Chat</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets and Popular Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="space-y-1">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    ))
                ) : recentTickets.length > 0 ? (
                    recentTickets.map(ticket => (
                        <Link href="#" key={ticket.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                            <div>
                                <p className="font-medium">{ticket.subject}</p>
                                <p className="text-sm text-muted-foreground">
                                    #{ticket.id.slice(0, 6)} &bull; {formatDistanceToNow(ticket.lastUpdated.toDate(), { addSuffix: true })}
                                </p>
                            </div>
                            <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                        </Link>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent tickets.</p>
                )}
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
        vendorId={VENDOR_ID}
      />
    </>
  );
}
