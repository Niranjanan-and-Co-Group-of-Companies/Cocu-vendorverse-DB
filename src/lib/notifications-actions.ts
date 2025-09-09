
'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
