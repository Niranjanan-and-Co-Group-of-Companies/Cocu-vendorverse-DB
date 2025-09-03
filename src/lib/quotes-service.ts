
'use server';

import { collection, onSnapshot, getDocs, writeBatch, doc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';

// --- Data Types ---

export type QuoteStatus = 'Pending' | 'Responded' | 'Accepted' | 'Declined';

export interface QuoteRequest {
    id: string;
    customerId: string;
    customerName: string;
    vendorId: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    customerNotes: string;
    attachments: { name: string; url: string }[];
    status: QuoteStatus;
    createdAt: any; // Firestore Timestamp
    vendorQuote?: VendorQuote;
}

export interface VendorQuote {
    finalPrice: number;
    estimatedCompletionDate: any; // Firestore Timestamp
    vendorNotes: string;
    respondedAt: any; // Firestore Timestamp
}


// --- Seeding Logic ---
async function seedQuoteRequests() {
    const quotesRef = collection(db, "quoteRequests");
    const snapshot = await getDocs(quotesRef);
    if (!snapshot.empty) {
        return;
    }
    
    const MOCK_REQUESTS: Omit<QuoteRequest, 'id'>[] = [
        {
            customerId: 'corp-123',
            customerName: 'Globex Corporation',
            vendorId: 'vendor001',
            productId: '1',
            productName: 'Artisanal Chocolate Box',
            productImage: 'https://picsum.photos/600/400?random=1',
            quantity: 500,
            customerNotes: 'We need custom branding on the box. Please see attached guidelines. The logo must be placed on the top lid, centered.',
            attachments: [
                { name: 'branding_guidelines.pdf', url: '#' },
                { name: 'logo.svg', url: '#' }
            ],
            status: 'Pending',
            createdAt: serverTimestamp(),
        },
        {
            customerId: 'corp-456',
            customerName: 'Soylent Corp',
            vendorId: 'vendor001',
            productId: '8',
            productName: 'Personalized Star Map',
            productImage: 'https://picsum.photos/600/400?random=8',
            quantity: 100,
            customerNotes: 'Need 100 unique star maps for different dates and locations for our top employees.',
            attachments: [],
            status: 'Responded',
            createdAt: serverTimestamp(),
            vendorQuote: {
                finalPrice: 4500.00,
                estimatedCompletionDate: serverTimestamp(),
                vendorNotes: 'Volume discount applied. We will need a CSV with the dates and locations.',
                respondedAt: serverTimestamp(),
            }
        }
    ];

    const batch = writeBatch(db);
    MOCK_REQUESTS.forEach(req => {
        const docRef = doc(quotesRef);
        batch.set(docRef, req);
    });
    await batch.commit();
}


// --- Service Functions ---

export async function onQuoteRequestsUpdate(vendorId: string, callback: (requests: QuoteRequest[]) => void): Promise<() => void> {
    const q = query(collection(db, 'quoteRequests'), where('vendorId', '==', vendorId));

    await seedQuoteRequests();

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuoteRequest));
        // Sort by status (Pending first), then by date
        requests.sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        callback(requests);
    });

    return unsubscribe;
}

export async function submitVendorQuote(requestId: string, quoteData: Omit<VendorQuote, 'respondedAt'>) {
    const requestRef = doc(db, 'quoteRequests', requestId);
    
    const vendorQuote: VendorQuote = {
        ...quoteData,
        respondedAt: serverTimestamp()
    };
    
    await updateDoc(requestRef, {
        vendorQuote: vendorQuote,
        status: 'Responded'
    });
}
