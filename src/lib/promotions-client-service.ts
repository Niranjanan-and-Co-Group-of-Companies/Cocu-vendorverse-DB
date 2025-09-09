
'use client';

import { 
    collection, 
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Unsubscribe } from 'firebase/firestore';
import type { Promotion } from './promotions-service';


// Get all promotions with real-time updates
export function onPromotionsUpdate(callback: (promotions: Promotion[]) => void): Unsubscribe {
    const q = query(collection(db, 'promotions'), orderBy('code'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const promotions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
        callback(promotions);
    });
    return unsubscribe;
}
