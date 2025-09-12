

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
 * This is a simplified calculation: Vendor SP / (1 - Commission Rate).
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
    
    const basePrice = productInfo.vendorSP || 0;

    const rules = await getCommissionRules();
    const ruleType = platform === 'Corporate' ? 'corporate-bulk' : 'personalized-retail';
    const rule = rules.find(r => r.categoryName === category?.name && r.type === ruleType);
    
    const commissionRate = rule ? rule.commissionRate / 100 : 0;
    
    if (commissionRate >= 1) {
        // Commission rate of 100% or more is invalid, return a fallback.
        return basePrice;
    }
    
    const customerPrice = basePrice / (1 - commissionRate);
    
    return Math.max(0, customerPrice);
}
