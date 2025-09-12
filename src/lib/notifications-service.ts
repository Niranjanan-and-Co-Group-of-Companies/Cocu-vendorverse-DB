

'use client';

import { collection, onSnapshot, query, where, orderBy, limit, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';

export type NotificationType = 
    | 'ORDER_STATUS_UPDATE' 
    | 'NEW_ORDER'
    | 'NEW_MESSAGE' 
    | 'NEW_BID_RESPONSE' 
    | 'NEW_VENDOR_SUBMISSION' 
    | 'USER_REPORT' 
    | 'CONTENT_UPDATE' 
    | 'NEW_SUPPORT_TICKET' 
    | 'NEW_SOURCING_REQUEST' 
    | 'SOURCING_REQUEST_UPDATE' 
    | 'NEW_BID_REQUEST';

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

export function onUserNotificationsUpdate(userId: string, callback: (notifications: Notification[]) => void): Unsubscribe {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(10)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    callback(notifications);
  }, (error) => {
    console.error(`Error fetching notifications for user ${userId}:`, error);
    callback([]);
  });

  return unsubscribe;
}
