
'use server';

import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';
import type { CommissionRule } from './commissions-service';
import type { Promotion } from './promotions-service';
import type { Category } from './categories-service';

export interface DisplayPrice {
    finalPrice: number;
    originalPrice: number;
    hasDiscount: boolean;
    discountText?: string;
    appliedPromotionId?: string;
}

// In a real high-traffic app, this would be a proper cache (e.g., Redis, Memcached)
let commissionRulesCache: CommissionRule[] | null = null;
let activePromotionsCache: Promotion[] | null = null;
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

async function getActivePublicPromotions(): Promise<Promotion[]> {
    const now = Date.now();
    if (activePromotionsCache && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
        return activePromotionsCache;
    }
    const promotionsRef = collection(db, 'promotions');
    const q = query(
        promotionsRef,
        where('status', '==', 'Active'),
        where('isPublic', '==', true)
    );

    const snapshot = await getDocs(q);
    const promotions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Promotion))
        .filter(p => !p.expiresAt || p.expiresAt.toDate().getTime() > now);
        
    activePromotionsCache = promotions;
    cacheTimestamp = now;
    return activePromotionsCache;
}

async function calculateFinalPrice(
    basePrice: number,
    platform: 'personal' | 'corporate',
    category: Category | undefined,
    productId: number | undefined
): Promise<DisplayPrice> {
     if (isNaN(basePrice)) {
         return { finalPrice: 0, originalPrice: 0, hasDiscount: false };
    }

    const rules = await getCommissionRules();
    const promotions = await getActivePublicPromotions();
    
    const ruleType = platform === 'personal' ? 'personalized-retail' : 'corporate-bulk';
    const rule = rules.find(r => r.categoryName === category?.name && r.type === ruleType);
    
    let buffer = 0;
    if (rule) {
        buffer = rule.bufferType === 'fixed' ? rule.bufferValue : basePrice * (rule.bufferValue / 100);
    }
    const originalPrice = basePrice + buffer;
    
    let bestDiscount = 0;
    let bestDiscountText = '';
    let appliedPromotionId: string | undefined = undefined;

    const platformName = platform === 'personal' ? 'Personalized' : 'Corporate';
    const applicablePromotions = promotions.filter(promo => {
        if (promo.platform !== platformName && promo.platform !== 'Both') {
            return false;
        }
        if (promo.scope === 'All Products') return true;
        if (promo.scope === 'Specific Categories' && category && promo.applicableCategoryIds?.includes(category.id)) return true;
        if (promo.scope === 'Specific Products' && productId && promo.applicableProductIds?.includes(String(productId))) return true;
        return false;
    });

    for (const promo of applicablePromotions) {
        let currentDiscount = 0;
        if (promo.type === 'Percentage') {
            currentDiscount = originalPrice * (promo.value / 100);
            if(promo.maxDiscount && currentDiscount > promo.maxDiscount) {
                currentDiscount = promo.maxDiscount;
            }
        } else if (promo.type === 'Fixed Amount') {
            currentDiscount = promo.value;
        }

        if (currentDiscount > bestDiscount) {
            bestDiscount = currentDiscount;
            bestDiscountText = promo.type === 'Percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`;
            appliedPromotionId = promo.id;
        }
    }

    const finalPrice = originalPrice - bestDiscount;
    const hasDiscount = bestDiscount > 0;

    return {
        finalPrice: Math.max(0, finalPrice),
        originalPrice,
        hasDiscount,
        discountText: bestDiscountText,
        appliedPromotionId,
    };
}


export async function calculateDisplayPrice(product: Product, platform: 'personal' | 'corporate' = 'personal', category?: Category): Promise<DisplayPrice> {
    const basePrice = parseFloat(String(product.price).replace('$', '').replace('₹', ''));
    return calculateFinalPrice(basePrice, platform, category, product.id);
}

export async function calculateDisplayPriceFromQuote(
    quotedPrice: number,
    product: Pick<Product, 'id' | 'category'>,
    category?: Category,
    platform: 'personal' | 'corporate' = 'corporate'
): Promise<DisplayPrice> {
    return calculateFinalPrice(quotedPrice, platform, category, product.id);
}
