
import { 
    collection, 
    onSnapshot, 
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    Unsubscribe 
} from 'firebase/firestore';
import { db } from '../firebase';

// --- Data Types ---

export type TicketCategory = 
    | 'Payouts & Finance' 
    | 'Orders & Cancellations' 
    | 'NDR/RTO' 
    | 'Product Listing/Approval' 
    | 'Customization Studio' 
    | 'KYC & Verification' 
    | 'Logistics & Labels' 
    | 'Technical Issue' 
    | 'Policy & Compliance' 
    | 'Feature Request';

export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Vendor' | 'Resolved';
export type TicketPriority = 'Normal' | 'Urgent';

export interface SupportTicket {
    id: string;
    vendorId: string;
    category: TicketCategory;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    references?: {
        orderId?: string;
        productId?: string;
        bidId?: string;
    };
    attachments: string[]; // array of file URLs
    createdAt: Timestamp;
    lastUpdated: Timestamp;
    isReadByVendor: boolean;
    expiresAt: Timestamp;
}

export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    category: string;
    content: string;
    lastUpdated: Timestamp;
}


// --- Mock Data & Seeding ---
// In a real app, this would be managed in the admin panel.
const MOCK_ARTICLES: Omit<KnowledgeBaseArticle, 'id' | 'lastUpdated'>[] = [
    { title: "How do I get paid?", category: "Payouts & Finance", content: "..." },
    { title: "How do I publish a new product?", category: "Products & Customization", content: "..." },
    { title: "What to do if my KYC verification fails?", category: "KYC & Verification", content: "..." },
    { title: "Understanding NDR and RTO", category: "Orders & Shipping", content: "..." },
];


// --- Service Functions ---

// Get recent tickets for the vendor dashboard
export function onRecentTicketsUpdate(vendorId: string, callback: (tickets: SupportTicket[]) => void): Unsubscribe {
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

// Get popular knowledge base articles
export async function getPopularArticles(): Promise<KnowledgeBaseArticle[]> {
    'use server';
  // In a real app, you might query based on view counts. Here, we'll just return mock data.
  return MOCK_ARTICLES.map((article, index) => ({
      ...article,
      id: `article-${index + 1}`,
      lastUpdated: Timestamp.now(),
  }));
}

// Create a new support ticket
export async function createSupportTicket(data: Omit<SupportTicket, 'id' | 'createdAt' | 'lastUpdated' | 'isReadByVendor' | 'expiresAt'>): Promise<string> {
    'use server';
    const now = Timestamp.now();
    const tenDaysFromNow = new Timestamp(now.seconds + 10 * 24 * 60 * 60, now.nanoseconds);
    
    const ticketRef = await addDoc(collection(db, 'supportTickets'), {
        ...data,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        isReadByVendor: true,
        expiresAt: tenDaysFromNow,
    });
    return ticketRef.id;
}
