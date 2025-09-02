
import { 
    collection, 
    onSnapshot,
    query,
    orderBy,
    type Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import type { SupportTicket } from '../vendor/support-service';

/**
 * Gets all support tickets from all vendors for the admin view.
 * @param callback Function to call with the array of tickets.
 * @returns An unsubscribe function for the real-time listener.
 */
export function onAllTicketsUpdate(callback: (tickets: SupportTicket[]) => void): Unsubscribe {
  const ticketsRef = collection(db, 'supportTickets');
  const q = query(ticketsRef, orderBy('lastUpdated', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicket));
    callback(tickets);
  }, (error) => {
    console.error("Error fetching all support tickets: ", error);
    callback([]);
  });

  return unsubscribe;
}
