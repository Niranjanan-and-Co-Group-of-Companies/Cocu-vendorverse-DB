
'use server';

import { 
    collection,
    query,
    where,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Promotion } from './promotions-service';

export async function getPromotionsForProduct(productId: string, categoryName: string, vendorId: string): Promise<Promotion[]> {
    const now = Timestamp.now();
    const promotions: Record<string, Promotion> = {};

    const queries = [
        // Promotions for this specific product
        query(collection(db, 'promotions'), where('appliesTo.products', 'array-contains', { id: productId, name: '' })), // Name is just a placeholder here
        // Promotions for this category
        query(collection(db, 'promotions'), where('appliesTo.categories', 'array-contains', { id: categoryName, name: '' })),
        // Promotions for this vendor
        query(collection(db, 'promotions'), where('appliesTo.vendors', 'array-contains', { id: vendorId, name: '' })),
        // Sitewide promotions
        query(collection(db, 'promotions'), where('appliesTo.products', '==', []), where('appliesTo.categories', '==', []), where('appliesTo.vendors', '==', []))
    ];

    for (const q of queries) {
        const baseQuery = query(
            q,
            where('status', '==', 'Active'),
            where('visibleOnPlatform', '==', true),
        );
        const snapshot = await getDocs(baseQuery);
        snapshot.forEach(doc => {
            const promo = { id: doc.id, ...doc.data() } as Promotion;
            // Check expiry date
            if (!promo.expiresAt || promo.expiresAt.toDate() > now.toDate()) {
                 if (!promotions[promo.id]) {
                    promotions[promo.id] = promo;
                }
            }
        });
    }

    return Object.values(promotions);
}
