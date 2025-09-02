
'use server';

import { 
    collection, 
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    Unsubscribe,
    getDocs
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


// Get popular knowledge base articles - This is a server action
export async function getPopularArticles(): Promise<KnowledgeBaseArticle[]> {
  // In a real app, you might query based on view counts. Here, we'll just return mock data.
  // This can be expanded to fetch from a 'knowledgeBase' collection in Firestore.
  return MOCK_ARTICLES.map((article, index) => ({
      ...article,
      id: `article-${index + 1}`,
      lastUpdated: Timestamp.now(),
  }));
}

// Create a new support ticket - This is a server action
export async function createSupportTicket(data: Omit<SupportTicket, 'id' | 'createdAt' | 'lastUpdated' | 'isReadByVendor' | 'expiresAt'>): Promise<string> {
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
