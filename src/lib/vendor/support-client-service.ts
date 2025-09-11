
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
