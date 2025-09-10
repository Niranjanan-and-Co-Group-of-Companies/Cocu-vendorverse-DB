
'use client';

import { 
    collection, 
    onSnapshot,
    query,
    orderBy,
    where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { SourcingRequest } from './sourcing-requests-service';

/**
 * Sets up a real-time listener for all sourcing requests for the admin panel.
 * @param callback Function to be called with the updated list of requests.
 * @returns Unsubscribe function for the listener.
 */
export function onSourcingRequestsUpdate(callback: (requests: SourcingRequest[]) => void): () => void {
    const q = query(collection(db, 'sourcingRequests'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SourcingRequest));
        callback(requests);
    }, (error) => {
        console.error("Error fetching sourcing requests: ", error);
        callback([]);
    });

    return unsubscribe;
}

/**
 * Sets up a real-time listener for a specific customer's sourcing requests.
 * @param customerId The ID of the corporate customer.
 * @param callback Function to be called with the updated list of requests.
 * @returns Unsubscribe function for the listener.
 */
export function onCustomerSourcingRequestsUpdate(customerId: string, callback: (requests: SourcingRequest[]) => void): () => void {
    const q = query(
        collection(db, 'sourcingRequests'), 
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SourcingRequest));
        callback(requests);
    }, (error) => {
        console.error(`Error fetching sourcing requests for customer ${customerId}: `, error);
        callback([]);
    });

    return unsubscribe;
}
