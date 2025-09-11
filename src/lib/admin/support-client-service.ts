
'use client';

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { SupportTicketMessage } from '../vendor/support-service';

// CLIENT-SIDE LISTENER for messages in a ticket
export function onMessagesUpdate(
  ticketId: string,
  callback: (messages: SupportTicketMessage[]) => void
): Unsubscribe {
  const messagesRef = collection(db, 'supportTickets', ticketId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as SupportTicketMessage)
      );
      callback(messages);
    },
    (error) => {
      console.error(`Error fetching messages for ticket ${ticketId}:`, error);
      callback([]);
    }
  );

  return unsubscribe;
}
