
'use client';

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { RmaLog } from '../returns-service';

/**
 * Sets up a real-time listener for all RMA requests for the admin panel.
 * @param callback Function to be called with the updated list of RMA logs.
 * @returns Unsubscribe function for the listener.
 */
export function onRmasUpdate(callback: (rmas: RmaLog[]) => void): Unsubscribe {
    const q = query(collection(db, 'returns_rma'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const rmas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RmaLog));
        callback(rmas);
    }, (error) => {
        console.error("Error fetching RMA logs: ", error);
        callback([]);
    });

    return unsubscribe;
}
