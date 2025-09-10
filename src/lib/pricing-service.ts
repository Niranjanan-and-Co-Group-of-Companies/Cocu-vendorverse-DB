
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
    basePrice: number, // This is the Vendor SP
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
    
    // Layer 1: Vendor SP (basePrice)
    
    // Layer 2: Calculate Customer Price (pre-discount) by adding buffer
    let buffer = 0;
    if (rule) {
        buffer = rule.bufferType === 'fixed' ? rule.bufferValue : basePrice * (rule.bufferValue / 100);
    }
    const customerPrice = basePrice + buffer;
    
    // Layer 3: Apply discount to the Customer Price
    let finalPrice = customerPrice;
    let hasDiscount = false;
    let discountText = '';
    
    if (discountValue && discountType) {
        hasDiscount = true;
        if (discountType === 'Percentage') {
            finalPrice = customerPrice * (1 - (discountValue / 100));
            discountText = `${discountValue}% OFF`;
        } else { // Fixed Amount
            finalPrice = customerPrice - discountValue;
            discountText = `₹${discountValue} OFF`;
        }
    }
    
    return {
        finalPrice: Math.max(0, finalPrice),
        originalPrice: customerPrice, // The original price shown to customer is the pre-discount price
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
