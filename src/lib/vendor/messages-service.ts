
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
import type { Notification } from '../notifications-service';

// Re-exporting for consistency, though this might be better in a central types file.
export type { Notification as VendorMessageNotification };

export type Conversation = {
    id: string;
    vendorId: string;
    customerId: string;
    customerName: string;
    lastMessage: string;
    lastMessageAt: any; // Firestore Timestamp
    unreadCount: number; // Unread for the vendor
    productContext?: {
        id: string;
        name: string;
        image: string;
    };
    type: 'Personalized' | 'Corporate';
};


/**
 * Sets up a real-time listener for a vendor's conversations.
 * @param vendorId The ID of the vendor.
 * @param callback Function to be called with the updated list of conversations.
 * @returns Unsubscribe function for the listener.
 */
export function onVendorConversationsUpdate(vendorId: string, callback: (conversations: Conversation[]) => void): Unsubscribe {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('vendorId', '==', vendorId),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
    callback(conversations);
  }, (error) => {
      console.error(`Error fetching conversations for vendor ${vendorId}:`, error);
      callback([]);
  });
}
