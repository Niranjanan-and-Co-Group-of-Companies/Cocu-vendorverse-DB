
'use server';

import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';
import type { CommissionRule } from './commissions-service';
import type { Category } from './categories-service';

export interface DisplayPrice {
    finalPrice: number;
    originalPrice: number;
    hasDiscount: boolean;
    discountText?: string;
}

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

export async function calculateFinalPrice(
    basePrice: number,
    platform: 'Personalized' | 'Corporate',
    category: Category | undefined,
    discountType?: 'Percentage' | 'Fixed Amount',
    discountValue?: number
): Promise<DisplayPrice> {
     if (isNaN(basePrice)) {
         return { finalPrice: 0, originalPrice: 0, hasDiscount: false };
    }

    const rules = await getCommissionRules();
    const ruleType = platform === 'Corporate' ? 'corporate-bulk' : 'personalized-retail';
    const rule = rules.find(r => r.categoryName === category?.name && r.type === ruleType);

    // First, apply any discount to the base price
    let discountedBasePrice = basePrice;
    let hasDiscount = false;
    let discountText = '';
    
    if (discountValue && discountType) {
        hasDiscount = true;
        if (discountType === 'Percentage') {
            discountedBasePrice = basePrice * (1 - (discountValue / 100));
            discountText = `${discountValue}% OFF`;
        } else { // Fixed Amount
            discountedBasePrice = basePrice - discountValue;
            discountText = `₹${discountValue} OFF`;
        }
    }
    
    let buffer = 0;
    if (rule) {
        // IMPORTANT: Buffer is calculated on the discounted price, not the original base price.
        buffer = rule.bufferType === 'fixed' ? rule.bufferValue : discountedBasePrice * (rule.bufferValue / 100);
    }
    
    const finalPrice = discountedBasePrice + buffer;
    
    return {
        finalPrice: Math.max(0, finalPrice),
        originalPrice: basePrice, // Original price is always the pre-discount, pre-buffer price
        hasDiscount,
        discountText,
    };
}


export async function calculateDisplayPrice(
    productVendorSP: string | number,
    platform: 'Personalized' | 'Corporate' = 'Personalized', 
    category: Category | undefined,
    discountType?: 'Percentage' | 'Fixed Amount',
    discountValue?: number
): Promise<DisplayPrice> {
    const basePrice = typeof productVendorSP === 'string' 
        ? parseFloat(productVendorSP.replace('$', '').replace('₹', '')) 
        : productVendorSP;
    return calculateFinalPrice(basePrice, platform, category, discountType, discountValue);
}

export async function calculateDisplayPriceFromQuote(
    quotedPrice: number,
    product: Pick<Product, 'id' | 'category'>,
    category?: Category,
    platform: 'Personalized' | 'Corporate' = 'Corporate'
): Promise<DisplayPrice> {
    // For quotes, we assume the quoted price is the base price and no further discounts apply
    return calculateFinalPrice(quotedPrice, platform, category, undefined, undefined);
}
