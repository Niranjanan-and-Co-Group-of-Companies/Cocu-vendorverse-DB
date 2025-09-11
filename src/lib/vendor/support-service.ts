
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
    getDocs,
    getDoc,
    doc,
    onSnapshot,
    updateDoc,
    increment,
    setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { createNotification } from '../notifications-actions';
import { getVendorById } from '../vendors-service';
import { generateReadableId } from '../id-service';

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

export interface SupportTicketMessage {
    id: string;
    senderId: string; // 'admin' or vendorId
    senderType: 'admin' | 'vendor' | 'system';
    text: string;
    timestamp: any;
}


export interface SupportTicket {
    id: string;
    ticketId: string; // Human-readable ID
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
    adminUnreadCount?: number;
}

export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    category: string;
    content: string;
    lastUpdated: string;
}


// --- Mock Data & Seeding ---
// In a real app, this would be managed in the admin panel.
const MOCK_ARTICLES: Omit<KnowledgeBaseArticle, 'id' | 'lastUpdated'>[] = [
    { title: "How do I get paid?", category: "Payouts & Finance", content: "Payouts are processed automatically every 15 days. You can view your upcoming and past payouts in the Financials section of your dashboard." },
    { title: "How do I publish a new product?", category: "Products & Customization", content: "To publish a new product, navigate to the 'Products' page, click 'Add Product', fill in all the required details, and submit for review. Our team will approve it within 48 hours." },
    { title: "What to do if my KYC verification fails?", category: "KYC & Verification", content: "If your KYC verification fails, you will receive an email with the specific reason. Please correct the information and re-submit. Common reasons include blurry documents or mismatched names." },
    { title: "Understanding NDR and RTO", category: "Orders & Shipping", content: "NDR (Non-Delivery Report) is generated when an order cannot be delivered. RTO (Return to Origin) is when the product is sent back to you. You will be notified for both and must take action within 24 hours." },
];


// Get popular knowledge base articles - This is a server action
export async function getPopularArticles(): Promise<KnowledgeBaseArticle[]> {
  // In a real app, you might query based on view counts. Here, we'll just return mock data.
  // This can be expanded to fetch from a 'knowledgeBase' collection in Firestore.
  return MOCK_ARTICLES.map((article, index) => ({
      ...article,
      id: `article-${index + 1}`,
      lastUpdated: new Date().toISOString(),
  }));
}

// Create a new support ticket
export async function createSupportTicket(data: Omit<SupportTicket, 'id' | 'createdAt' | 'lastUpdated' | 'isReadByVendor' | 'ticketId'>): Promise<string> {
    const timestamp = serverTimestamp();
    const ticketRef = doc(collection(db, 'supportTickets')); // Generate a new document reference with an auto-generated ID
    const ticketId = generateReadableId('TKT');

    const ticketData = {
        ...data,
        ticketId,
        createdAt: timestamp,
        lastUpdated: timestamp,
        isReadByVendor: true,
        adminUnreadCount: 1, // Initialize unread count for admin
    };
    await setDoc(ticketRef, ticketData); // Use setDoc with the new reference

    // After creating the ticket, notify the admin
    await createNotification({
        userId: 'admin',
        forAdmin: true,
        type: 'NEW_SUPPORT_TICKET',
        text: `New support ticket ${ticketId} from vendor ${data.vendorId}: "${data.subject}"`,
        link: `/admin/support?ticketId=${ticketRef.id}`
    });

    return ticketRef.id;
}


/**
 * Sends a message from the vendor to a support ticket.
 */
export async function sendVendorSupportMessage(ticket: SupportTicket, text: string): Promise<void> {
    const ticketRef = doc(db, 'supportTickets', ticket.id);
    const messagesRef = collection(ticketRef, 'messages');

    // Add new message
    await addDoc(messagesRef, {
        senderId: ticket.vendorId,
        senderType: 'vendor',
        text,
        timestamp: serverTimestamp(),
    });

    // Update ticket metadata
    await updateDoc(ticketRef, {
        lastUpdated: serverTimestamp(),
        status: 'In Progress', // Vendor replied, so it's back in admin's court
        isReadByVendor: true, // The vendor just sent a message, so they've "read" it
        adminUnreadCount: increment(1)
    });
    
    // Send notification to admin
    await createNotification({
        userId: 'admin',
        forAdmin: true,
        type: 'NEW_MESSAGE',
        text: `New reply from vendor ${ticket.vendorId} on ticket #${ticket.ticketId}.`,
        link: `/admin/support?ticketId=${ticket.id}`
    });
}


export async function markConversationAsReadByVendor(ticketId: string): Promise<void> {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    await updateDoc(ticketRef, {
        isReadByVendor: true
    });
}
