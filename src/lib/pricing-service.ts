

'use server';

import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, TieredPrice } from './products';
import type { CommissionRule } from './commissions-service';
import type { Category } from './categories-service';
import { getPromotionsForProduct } from './promotions-actions';
import type { PlainPromotion } from './promotions-service';

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
        price?: string;
        tieredPricing?: TieredPrice[];
    },
    platform: 'Personalized' | 'Corporate' = 'Personalized', 
    category: Category | undefined,
    quantity: number = 1
): Promise<DisplayPrice> {
    
    let basePrice = productInfo.vendorSP;
    if (isNaN(basePrice)) {
      basePrice = 0;
    }

    if (platform === 'Corporate' && productInfo.tieredPricing && productInfo.tieredPricing.length > 0) {
        const sortedTiers = [...productInfo.tieredPricing].sort((a, b) => b.quantity - a.quantity);
        const applicableTier = sortedTiers.find(tier => quantity >= tier.quantity);
        if (applicableTier && applicableTier.price) {
            basePrice = parseFloat(applicableTier.price.replace('$', '').replace('₹', ''));
        }
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
    
    let discountType = productInfo.discountType;
    let discountValue = productInfo.discountValue;

    // Fetch and apply automatic promotions
    const promotions = await getPromotionsForProduct(productInfo.id, productInfo.category || '', productInfo.vendorId, platform);
    const firstApplicablePromotion = promotions.find(p => p.visibleOnPlatform && p.type !== 'Free Shipping');
    
    // An automatic promotion can override a product-level discount if it's better
    // For simplicity, we'll let the automatic promotion take precedence if it exists.
    if (firstApplicablePromotion) {
        discountType = firstApplicablePromotion.type as 'Percentage' | 'Fixed Amount';
        discountValue = firstApplicablePromotion.value;
    }
    
    if (discountValue && discountType) {
        hasDiscount = true;
        if (discountType === 'Percentage') {
            finalPrice = customerPrice * (1 - (discountValue / 100));
            discountText = `${discountValue}% OFF`;
        } else {
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
    quotedPrice: number, // Vendor's quoted price PER UNIT (VendorSP)
    productId: string,
    category?: Category,
    platform: 'Personalized' | 'Corporate' = 'Corporate'
): Promise<DisplayPrice> {

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
