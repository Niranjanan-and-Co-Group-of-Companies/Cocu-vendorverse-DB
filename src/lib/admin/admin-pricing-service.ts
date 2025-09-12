

'use server';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { CommissionRule } from '../commissions-service';
import type { Category } from '../categories-service';

let commissionRulesCache: CommissionRule[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCommissionRules(): Promise<CommissionRule[]> {
    const now = Date.now();
    if (commissionRulesCache && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
        return commissionRulesCache;
    }
    const snapshot = await getDocs(collection(db, 'commissions'));
    commissionRulesCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommissionRule));
    cacheTimestamp = now;
    return commissionRulesCache;
}

/**
 * Calculates the base display price for the admin panel.
 * With the new commission model, this is simply the vendor's selling price.
 * It does NOT include any promotional discounts.
 */
export async function calculateAdminDisplayPrice(
    productInfo: {
        vendorSP: number;
        category?: string;
    },
    platform: 'Personalized' | 'Corporate' = 'Personalized', 
    category: Category | undefined,
): Promise<number> {
    
    // The customer price is simply the Vendor's Selling Price.
    const customerPrice = productInfo.vendorSP || 0;
    
    return customerPrice;
}
