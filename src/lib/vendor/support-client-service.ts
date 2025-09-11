
'use client';

import { 
    collection, 
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    type Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import type { SupportTicket } from './support-service';

/**
 * Sets up a real-time listener for all of a vendor's support tickets.
 * @param vendorId The ID of the vendor.
 * @param callback Function to be called with the updated list of tickets.
 * @returns Unsubscribe function for the listener.
 */
export function onAllVendorTicketsUpdate(vendorId: string, callback: (tickets: SupportTicket[]) => void): Unsubscribe {
  const ticketsRef = collection(db, 'supportTickets');
  const q = query(
    ticketsRef,
    where('vendorId', '==', vendorId),
    orderBy('lastUpdated', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicket));
    callback(tickets);
  });
}
