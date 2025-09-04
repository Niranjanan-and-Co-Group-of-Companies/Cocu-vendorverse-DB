
import { collection, onSnapshot, getDocs, writeBatch, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';

export type PromotionType = 'Percentage' | 'Fixed Amount';
export type PromotionStatus = 'Active' | 'Inactive' | 'Expired';
export type PromotionPlatform = 'Personalized' | 'Corporate' | 'Both';
export type PromotionScope = 'All Products' | 'Specific Categories' | 'Specific Products';

export interface Promotion {
    id: string;
    code: string;
    type: PromotionType;
    value: number;
    platform: PromotionPlatform;
    status: PromotionStatus;
    usageCount: number;
    usageLimit?: number | null;
    expiresAt?: any; // Firestore Timestamp
    createdAt: any; // Firestore Timestamp
    maxDiscount?: number | null;
    scope: PromotionScope;
    isPublic: boolean; // New field
    applicableCategoryIds?: string[];
    applicableProductIds?: string[];
}

const MOCK_PROMOTIONS: Omit<Promotion, 'id' | 'createdAt'>[] = [
    { code: 'SUMMER24', type: 'Percentage', value: 15, platform: 'Personalized', status: 'Active', usageCount: 152, expiresAt: new Date(2024, 7, 31), scope: 'All Products', isPublic: true },
    { code: 'CORPWELCOME', type: 'Fixed Amount', value: 100, platform: 'Corporate', status: 'Active', usageCount: 890, usageLimit: 1000, scope: 'All Products', isPublic: false },
    { code: 'FLASHFRIDAY', type: 'Percentage', value: 25, platform: 'Both', status: 'Expired', usageCount: 50, expiresAt: new Date(2024, 4, 17), scope: 'All Products', isPublic: true },
    { code: 'LAUNCHGIFT', type: 'Fixed Amount', value: 200, platform: 'Both', status: 'Inactive', usageCount: 0, scope: 'Specific Categories', applicableCategoryIds: ['food-drink'], isPublic: false },
];

async function seedPromotions() {
    const promotionsRef = collection(db, "promotions");
    const snapshot = await getDocs(promotionsRef);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        MOCK_PROMOTIONS.forEach(promo => {
            const docRef = doc(promotionsRef);
            batch.set(docRef, { ...promo, createdAt: serverTimestamp() });
        });
        await batch.commit();
        console.log("Seeded promotions data.");
    }
}

// Get all promotions with real-time updates
export function onPromotionsUpdate(callback: (promotions: Promotion[]) => void): () => void {
    const promotionsRef = collection(db, 'promotions');
    
    seedPromotions();

    const unsubscribe = onSnapshot(promotionsRef, (snapshot) => {
        const promotionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Promotion));
        promotionsData.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
        callback(promotionsData);
    });

    return unsubscribe;
}

// Add or update a promotion
export async function savePromotion(promotion: Partial<Promotion>) {
    const { id, ...data } = promotion;

    if (id) {
        const docRef = doc(db, 'promotions', id);
        await updateDoc(docRef, data);
    } else {
        await addDoc(collection(db, 'promotions'), {
            ...data,
            usageCount: 0,
            createdAt: serverTimestamp(),
            isPublic: data.isPublic || false, // Ensure default value
        });
    }
}

// Update promotion status
export async function updatePromotionStatus(id: string, status: PromotionStatus) {
    const docRef = doc(db, 'promotions', id);
    await updateDoc(docRef, { status });
}

// Delete a promotion
export async function deletePromotion(id: string) {
    const docRef = doc(db, 'promotions', id);
    await deleteDoc(docRef);
}

// Get public, active promotions for a given product/category
export async function getAvailableOffers(category?: string, productId?: number): Promise<Promotion[]> {
    if (!category && !productId) return [];

    const promotionsRef = collection(db, 'promotions');
    const now = Timestamp.now();

    // Base query for active, public promotions
    const q = query(
        promotionsRef,
        where('status', '==', 'Active'),
        where('isPublic', '==', true),
        where('platform', 'in', ['Both', 'Personalized']),
        // Note: Firestore does not support 'OR' queries on different fields.
        // We will fetch all public promotions and filter client-side.
        // For a large-scale app, this would be handled server-side or with a more complex data structure.
    );

    const snapshot = await getDocs(q);
    const allPublicPromos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Promotion))
        .filter(promo => !promo.expiresAt || promo.expiresAt.toDate() > new Date());
        
    // Client-side filtering
    const applicablePromos = allPublicPromos.filter(promo => {
        if (promo.scope === 'All Products') {
            return true;
        }
        if (promo.scope === 'Specific Categories' && category && promo.applicableCategoryIds?.includes(category)) {
            return true;
        }
        if (promo.scope === 'Specific Products' && productId && promo.applicableProductIds?.includes(String(productId))) {
            return true;
        }
        return false;
    });

    return applicablePromos;
}
