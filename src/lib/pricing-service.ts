
'use server';

import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';
import type { CommissionRule } from './commissions-service';
import type { Category } from './categories-service';
import { getPromotionsForProduct } from './promotions-actions';
import type { Promotion } from './promotions-service';

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


export async function calculateDisplayPrice(
    productInfo: {
        id: string;
        vendorSP: number;
        category?: string;
        vendorId: string;
        discountType?: 'Percentage' | 'Fixed Amount';
        discountValue?: number;
    },
    platform: 'Personalized' | 'Corporate' = 'Personalized', 
    category: Category | undefined,
): Promise<DisplayPrice> {
    const basePrice = productInfo.vendorSP;
    if (isNaN(basePrice)) {
        return { finalPrice: 0, originalPrice: 0, hasDiscount: false };
    }

    const rules = await getCommissionRules();
    const ruleType = platform === 'Corporate' ? 'corporate-bulk' : 'personalized-retail';
    const rule = rules.find(r => r.categoryName === category?.name && r.type === ruleType);
    
    let buffer = 0;
    if (rule) {
        buffer = rule.bufferType === 'fixed' ? rule.bufferValue : basePrice * (rule.bufferValue / 100);
    }
    const customerPrice = basePrice + buffer;
    
    let finalPrice = customerPrice;
    let hasDiscount = false;
    let discountText = '';
    let discountType: 'Percentage' | 'Fixed Amount' | undefined = productInfo.discountType;
    let discountValue: number | undefined = productInfo.discountValue;

    // 1. Check for active promotions first
    if(platform === 'Personalized') {
        const promotions = await getPromotionsForProduct(productInfo.id, productInfo.category || '', productInfo.vendorId);
        const firstApplicablePromotion = promotions.find(p => p.visibleOnPlatform && p.type !== 'Free Shipping');
        
        if (firstApplicablePromotion) {
            discountType = firstApplicablePromotion.type as 'Percentage' | 'Fixed Amount';
            discountValue = firstApplicablePromotion.value;
        }
    }
    
    // 2. Apply the highest priority discount (promotions, then direct)
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
        originalPrice: customerPrice,
        hasDiscount,
        discountText,
    };
}

export async function calculateDisplayPriceFromQuote(
    quotedPrice: number,
    product: Pick<Product, 'id' | 'category'>,
    category?: Category,
    platform: 'Personalized' | 'Corporate' = 'Corporate'
): Promise<DisplayPrice> {
    // For quotes, we assume the quoted price is the base price and no further discounts apply
    const rules = await getCommissionRules();
    const ruleType = platform === 'Corporate' ? 'corporate-bulk' : 'personalized-retail';
    const rule = rules.find(r => r.categoryName === category?.name && r.type === ruleType);
    
    let buffer = 0;
    if (rule) {
        buffer = rule.bufferType === 'fixed' ? rule.bufferValue : quotedPrice * (rule.bufferValue / 100);
    }
    const customerPrice = quotedPrice + buffer;
    
    return {
        finalPrice: customerPrice,
        originalPrice: customerPrice,
        hasDiscount: false,
    };
}
