
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
 * This is a simplified calculation: Vendor SP + Buffer.
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
    
    let buffer = 0;
    if (rule) {
        buffer = rule.bufferType === 'fixed' ? rule.bufferValue : basePrice * (rule.bufferValue / 100);
    }
    
    const customerPrice = basePrice + buffer;
    
    return Math.max(0, customerPrice);
}
