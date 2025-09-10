

'use server';

import { 
    collection,
    query,
    where,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Promotion, PlainPromotion } from './promotions-service';

export async function getPromotionsForProduct(productId: string, category: string, vendorId: string): Promise<PlainPromotion[]> {
    const now = Timestamp.now();
    const promotions: Record<string, Promotion> = {};

    // A product can be targeted directly, or through its category or vendor.
    const queries = [
        // Sitewide promotions (where appliesTo is empty)
        query(collection(db, 'promotions'), 
            where('appliesTo.products', '==', []),
            where('appliesTo.categories', '==', []),
            where('appliesTo.vendors', '==', [])
        ),
        // Promotions for this specific product
        query(collection(db, 'promotions'), where('appliesTo.products', 'array-contains', productId)),
        // Promotions for this category
        query(collection(db, 'promotions'), where('appliesTo.categories', 'array-contains', category)),
        // Promotions for this vendor
        query(collection(db, 'promotions'), where('appliesTo.vendors', 'array-contains', vendorId)),
    ];

    for (const q of queries) {
        const baseQuery = query(
            q,
            where('status', '==', 'Active'),
        );

        const snapshot = await getDocs(baseQuery);
        snapshot.forEach(doc => {
            const promo = { id: doc.id, ...doc.data() } as Promotion;
            // Check expiry date
            if (!promo.expiresAt || (promo.expiresAt.toDate && promo.expiresAt.toDate() > now.toDate())) {
                if (!promotions[promo.id]) {
                    promotions[promo.id] = promo;
                }
            }
        });
    }
    
    // Sort to have the most specific (product-level) promotion first
    const sortedPromotions = Object.values(promotions).sort((a, b) => {
        const aSpecificity = a.appliesTo.products.length + a.appliesTo.categories.length + a.appliesTo.vendors.length;
        const bSpecificity = b.appliesTo.products.length + b.appliesTo.categories.length + b.appliesTo.vendors.length;
        return bSpecificity - aSpecificity; // Higher specificity first
    });

    // Serialize Firestore Timestamps to strings before returning to the client
    return sortedPromotions.map(promo => ({
        ...promo,
        startDate: promo.startDate?.toDate ? promo.startDate.toDate().toISOString() : null,
        expiresAt: promo.expiresAt?.toDate ? promo.expiresAt.toDate().toISOString() : null,
    }));
}
