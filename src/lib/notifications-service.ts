
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type NotificationType = 'ORDER_STATUS_UPDATE' | 'NEW_MESSAGE' | 'NEW_BID_RESPONSE' | 'new_vendor' | 'user_report' | 'content_update';

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
