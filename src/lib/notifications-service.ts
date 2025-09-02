

import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, limit, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';

export type NotificationType = 'ORDER_STATUS_UPDATE' | 'NEW_MESSAGE' | 'NEW_BID_RESPONSE' | 'new_vendor' | 'user_report' | 'content_update' | 'new_ticket';

export interface Notification {
    id?: string;
    userId: string; // The user who should see the notification
    forAdmin?: boolean; // Flag for admin-specific notifications
    type: NotificationType;
    text: string;
    isRead: boolean;
    timestamp: any; // Firestore Server Timestamp
    link: string;
}

export async function createNotification(data: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) {
    try {
        await addDoc(collection(db, 'notifications'), {
            ...data,
            isRead: false,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating notification: ", error);
    }
}

export function onAdminNotificationsUpdate(callback: (notifications: Notification[]) => void): Unsubscribe {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('forAdmin', '==', true),
    orderBy('timestamp', 'desc'),
    limit(10) // Limit to 10 most recent notifications for the dropdown
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    callback(notifications);
  }, (error) => {
    console.error("Error fetching admin notifications:", error);
    callback([]);
  });

  return unsubscribe;
}
