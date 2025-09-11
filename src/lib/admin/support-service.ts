
'use server';

import { 
    collection, 
    onSnapshot,
    query,
    orderBy,
    where,
    type Unsubscribe,
    addDoc,
    serverTimestamp,
    updateDoc,
    doc,
    increment
} from 'firebase/firestore';
import { db } from '../firebase';
import type { SupportTicket, SupportTicketMessage } from '../vendor/support-service';
import { createNotification } from '../notifications-actions';

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


/**
 * Gets a real-time count of open support tickets.
 * @param callback Function to call with the count of open tickets.
 * @returns An unsubscribe function for the real-time listener.
 */
export function getOpenTicketCount(callback: (count: number) => void): Unsubscribe {
  const ticketsRef = collection(db, 'supportTickets');
  const q = query(ticketsRef, where('status', 'in', ['Open', 'In Progress']));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  }, (error) => {
    console.error("Error fetching open ticket count: ", error);
    callback(0);
  });

  return unsubscribe;
}

/**
 * Sends a message from the admin to a support ticket.
 * @param ticket - The support ticket object.
 * @param text - The message content.
 */
export async function sendAdminSupportMessage(ticket: SupportTicket, text: string): Promise<void> {
    const ticketRef = doc(db, 'supportTickets', ticket.id);
    const messagesRef = collection(ticketRef, 'messages');

    // Add new message
    await addDoc(messagesRef, {
        senderId: 'admin',
        senderType: 'admin',
        text,
        timestamp: serverTimestamp(),
    });

    // Update ticket metadata
    await updateDoc(ticketRef, {
        lastUpdated: serverTimestamp(),
        status: 'Waiting on Vendor',
        isReadByVendor: false,
        unreadVendorCount: increment(1)
    });
    
    // Send notification to vendor
    await createNotification({
        userId: ticket.vendorId,
        type: 'NEW_MESSAGE',
        text: `You have a new reply on support ticket #${ticket.id.slice(0, 6)}.`,
        link: `/vendor/support?ticketId=${ticket.id}`
    });
}

// CLIENT-SIDE LISTENER for messages in a ticket
export function onMessagesUpdate(ticketId: string, callback: (messages: SupportTicketMessage[]) => void): Unsubscribe {
  const messagesRef = collection(db, 'supportTickets', ticketId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicketMessage));
    callback(messages);
  }, (error) => {
      console.error(`Error fetching messages for ticket ${ticketId}:`, error);
      callback([]);
  });

  return unsubscribe;
}
