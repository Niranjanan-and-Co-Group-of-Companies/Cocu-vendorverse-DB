
'use server';

import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Notification } from './notifications-service';

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

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    try {
        await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        // Optionally re-throw or handle the error as needed
        throw error;
    }
}
