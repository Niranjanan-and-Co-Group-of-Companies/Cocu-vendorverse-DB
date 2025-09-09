
'use server';

import { 
    collection, 
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export type PromotionType = 'Percentage' | 'Fixed Amount' | 'Free Shipping';
export type PromotionStatus = 'Active' | 'Inactive' | 'Expired';
export type PromotionPlatform = 'Personalized' | 'Corporate' | 'Both';
export type ConditionType = 'min-purchase' | 'customer-segment' | 'product-category';

export interface Condition {
    type: ConditionType;
    value: string | number;
}

export interface Promotion {
  id: string;
  code: string;
  type: PromotionType;
  value: number;
  description?: string;
  status: PromotionStatus;
  platform: PromotionPlatform;
  usageLimit: number;
  usageCount: number;
  expiresAt?: any; // Firestore Timestamp
  conditions: Condition[];
}

const promotionsCollection = collection(db, 'promotions');

// Seed data
const MOCK_PROMOTIONS: Omit<Promotion, 'id'>[] = [
    { code: 'SAVE10', type: 'Percentage', value: 10, description: '10% off entire order', status: 'Active', platform: 'Personalized', usageLimit: 1000, usageCount: 452, expiresAt: new Date('2024-12-31'), conditions: [] },
    { code: 'CORP500', type: 'Fixed Amount', value: 500, description: '₹500 off for corporate clients', status: 'Active', platform: 'Corporate', usageLimit: 200, usageCount: 89, conditions: [{ type: 'min-purchase', value: 10000 }] },
    { code: 'FREESHIP', type: 'Free Shipping', value: 0, description: 'Free standard shipping', status: 'Inactive', platform: 'Both', usageLimit: 5000, usageCount: 2314, conditions: [] },
    { code: 'DIWALI20', type: 'Percentage', value: 20, description: 'Diwali special - 20% off', status: 'Expired', platform: 'Personalized', usageLimit: 2000, usageCount: 1987, expiresAt: new Date('2023-11-15'), conditions: [] },
];

async function seedPromotions() {
    const snapshot = await getDocs(promotionsCollection);
    if (snapshot.empty) {
        console.log("Seeding promotions...");
        const batch = writeBatch(db);
        MOCK_PROMOTIONS.forEach(promo => {
            const docRef = doc(promotionsCollection);
            batch.set(docRef, promo);
        });
        await batch.commit();
    }
}

// Set up a one-time seed
seedPromotions();

// Save or update a promotion
export async function savePromotion(promotion: Partial<Promotion>): Promise<void> {
    const { id, ...promoData } = promotion;
    if (id) {
        await updateDoc(doc(promotionsCollection, id), promoData);
    } else {
        await addDoc(promotionsCollection, { ...promoData, usageCount: 0 });
    }
}

// Delete a promotion
export async function deletePromotion(promotionId: string): Promise<void> {
    await deleteDoc(doc(promotionsCollection, promotionId));
}
