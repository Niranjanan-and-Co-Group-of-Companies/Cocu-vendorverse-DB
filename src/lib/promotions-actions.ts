

'use server';

import { 
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    limit
} from 'firebase/firestore';
import { db } from './firebase';
import type { Promotion, PlainPromotion, PromotionPlatform } from './promotions-service';

export async function getPromotionsForProduct(productId: string, category: string, vendorId: string, platform: PromotionPlatform): Promise<PlainPromotion[]> {
    const now = Timestamp.now();
    const promotions: Record<string, Promotion> = {};
    
    const platformFilter = platform === 'Both' ? ['Personalized', 'Corporate', 'Both'] : [platform, 'Both'];

    // Build a list of queries to execute
    const queries = [
        // Sitewide promotions (where all targeting arrays are empty)
        query(collection(db, 'promotions'), 
            where('appliesTo.products', '==', []),
            where('appliesTo.categories', '==', []),
            where('appliesTo.vendors', '==', [])
        ),
        // Promotions for this specific product
        query(collection(db, 'promotions'), where('appliesTo.products', 'array-contains', productId)),
    ];
    
    // Only add category and vendor queries if they exist to avoid querying for empty strings
    if (category) {
        queries.push(query(collection(db, 'promotions'), where('appliesTo.categories', 'array-contains', category)));
    }
    if (vendorId) {
        queries.push(query(collection(db, 'promotions'), where('appliesTo.vendors', 'array-contains', vendorId)));
    }

    for (const q of queries) {
        // Apply common filters to each query
        const finalQuery = query(
            q,
            where('status', '==', 'Active'),
            where('platform', 'in', platformFilter)
        );

        const snapshot = await getDocs(finalQuery);
        snapshot.forEach(doc => {
            const promo = { id: doc.id, ...doc.data() } as Promotion;
            
            // Check expiry date if it exists
            const isNotExpired = !promo.expiresAt || (promo.expiresAt.toDate && promo.expiresAt.toDate() > now.toDate());
            
            if (isNotExpired && !promotions[promo.id]) {
                promotions[promo.id] = promo;
            }
        });
    }
    
    // Sort to have the most specific (product-level) promotion first
    const sortedPromotions = Object.values(promotions).sort((a, b) => {
        const aSpecificity = (a.appliesTo?.products?.length || 0) + (a.appliesTo?.categories?.length || 0) + (a.appliesTo?.vendors?.length || 0);
        const bSpecificity = (b.appliesTo?.products?.length || 0) + (b.appliesTo?.categories?.length || 0) + (b.appliesTo?.vendors?.length || 0);
        return bSpecificity - aSpecificity; // Higher specificity first
    });

    // Serialize Firestore Timestamps to strings before returning to the client
    return sortedPromotions.map(promo => ({
        ...promo,
        startDate: promo.startDate?.toDate ? promo.startDate.toDate().toISOString() : null,
        expiresAt: promo.expiresAt?.toDate ? promo.expiresAt.toDate().toISOString() : null,
    }));
}


export async function getPromotionByCode(code: string): Promise<PlainPromotion | null> {
    if (!code) return null;
    
    const promotionsRef = collection(db, 'promotions');
    const q = query(
        promotionsRef,
        where('code', '==', code.toUpperCase()),
        where('status', '==', 'Active'),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }

    const promoDoc = snapshot.docs[0];
    const promo = { id: promoDoc.id, ...promoDoc.data() } as Promotion;
    
    const now = Timestamp.now();
    const isNotExpired = !promo.expiresAt || (promo.expiresAt.toDate && promo.expiresAt.toDate() > now.toDate());

    if (!isNotExpired) {
        return null;
    }

    return {
        ...promo,
        startDate: promo.startDate?.toDate ? promo.startDate.toDate().toISOString() : null,
        expiresAt: promo.expiresAt?.toDate ? promo.expiresAt.toDate().toISOString() : null,
    };
}
