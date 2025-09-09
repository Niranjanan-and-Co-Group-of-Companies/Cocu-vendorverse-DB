
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
    commissionRulesCache = snapshot.docs.map(doc => doc.data() as CommissionRule);
    cacheTimestamp = now;
    return commissionRulesCache;
}

async function calculateFinalPrice(
    basePrice: number,
    platform: 'personal' | 'corporate',
    category: Category | undefined,
    product: Product
): Promise<DisplayPrice> {
     if (isNaN(basePrice)) {
         return { finalPrice: 0, originalPrice: 0, hasDiscount: false };
    }

    const rules = await getCommissionRules();
    const ruleType = platform === 'personal' ? 'personalized-retail' : 'corporate-bulk';
    const rule = rules.find(r => r.categoryName === category?.name && r.type === ruleType);
    
    let buffer = 0;
    if (rule) {
        buffer = rule.bufferType === 'fixed' ? rule.bufferValue : basePrice * (rule.bufferValue / 100);
    }
    const originalPrice = basePrice + buffer;
    
    let finalPrice = originalPrice;
    let hasDiscount = false;
    let discountText = '';

    if (product.discountValue && product.discountType) {
        hasDiscount = true;
        if (product.discountType === 'Percentage') {
            finalPrice = originalPrice * (1 - (product.discountValue / 100));
            discountText = `${product.discountValue}% OFF`;
        } else { // Fixed Amount
            finalPrice = originalPrice - product.discountValue;
            discountText = `₹${product.discountValue} OFF`;
        }
    }
    
    return {
        finalPrice: Math.max(0, finalPrice),
        originalPrice,
        hasDiscount,
        discountText,
    };
}


export async function calculateDisplayPrice(product: Product, platform: 'personal' | 'corporate' = 'personal', category?: Category): Promise<DisplayPrice> {
    const basePrice = parseFloat(String(product.price).replace('$', '').replace('₹', ''));
    return calculateFinalPrice(basePrice, platform, category, product);
}

export async function calculateDisplayPriceFromQuote(
    quotedPrice: number,
    product: Pick<Product, 'id' | 'category'>,
    category?: Category,
    platform: 'personal' | 'corporate' = 'corporate'
): Promise<DisplayPrice> {
    // For quotes, we assume the quoted price is the base price and no further discounts apply
    const mockProduct = { price: String(quotedPrice) } as Product;
    return calculateFinalPrice(quotedPrice, platform, category, mockProduct);
}
