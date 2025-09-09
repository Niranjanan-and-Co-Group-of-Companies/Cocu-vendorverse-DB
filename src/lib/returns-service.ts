
'use server';

import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

type RmaStatus = 'Pending Approval' | 'Approved' | 'Rejected' | 'In Transit' | 'Received' | 'Refunded';
type ReturnReason = 'Damaged Item' | 'Wrong Item' | 'Not as Described' | 'Changed Mind' | 'Other';


interface RmaItem {
    productId: string;
    suborderId: string;
    quantity: number;
}

interface RmaLog {
    id?: string;
    rmaId: string; // Human-readable RMA ID
    orderId: string;
    items: RmaItem[];
    reason: ReturnReason;
    customerComments?: string;
    status: RmaStatus;
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
    refundDetails?: {
        amount: number;
        method: 'StoreCredit' | 'OriginalPaymentMethod';
        processedAt: any;
    }
}

/**
 * Creates a return request (RMA).
 * @param data - The data for the return request.
 */
export async function createReturnRequest(data: Omit<RmaLog, 'id' | 'rmaId' | 'status' | 'createdAt' | 'updatedAt'>) {
    const rmaId = `RMA-${Date.now()}`; // Simple unique ID generation
    
    await addDoc(collection(db, 'returns_rma'), {
        ...data,
        rmaId,
        status: 'Pending Approval',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // Notify admin and vendor
    // ... notification logic would go here
    
    return rmaId;
}

/**
 * Fetches return requests for a specific order.
 * @param orderId - The ID of the order to fetch returns for.
 */
export async function getReturnsForOrder(orderId: string): Promise<RmaLog[]> {
    const q = query(collection(db, 'returns_rma'), where('orderId', '==', orderId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RmaLog));
}
