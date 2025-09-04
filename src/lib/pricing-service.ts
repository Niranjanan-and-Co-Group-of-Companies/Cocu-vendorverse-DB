
'use server';

import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';
import type { CommissionRule } from './commissions-service';
import type { Campaign } from './marketing-service';

export interface DisplayPrice {
    finalPrice: number;
    originalPrice: number;
    hasDiscount: boolean;
    discountText?: string;
    appliedCampaignId?: string;
}

// --- Cached Data ---
// In a real high-traffic app, this would be a proper cache (e.g., Redis, Memcached)
let commissionRulesCache: CommissionRule[] | null = null;
let activeCampaignsCache: Campaign[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCommissionRules(): Promise<CommissionRule[]> {
    if (commissionRulesCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return commissionRulesCache;
    }
    const snapshot = await getDocs(collection(db, 'commissions'));
    commissionRulesCache = snapshot.docs.map(doc => doc.data() as CommissionRule);
    cacheTimestamp = Date.now();
    return commissionRulesCache;
}

async function getActiveCampaigns(): Promise<Campaign[]> {
     if (activeCampaignsCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return activeCampaignsCache;
    }
    const campaignsRef = collection(db, 'marketingCampaigns');
    const now = Timestamp.now();
    const q = query(
        campaignsRef,
        where('status', '==', 'Active'),
        where('startDate', '<=', now)
    );

    const snapshot = await getDocs(q);
    const campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign))
        .filter(c => !c.endDate || c.endDate.toDate() > new Date()); // Further filter by end date
        
    activeCampaignsCache = campaigns;
    cacheTimestamp = Date.now();
    return activeCampaignsCache;
}


export async function calculateDisplayPrice(product: Product, platform: 'personal' | 'corporate' = 'personal'): Promise<DisplayPrice> {
    const basePrice = parseFloat(product.price.replace('$', ''));
    if (isNaN(basePrice)) {
         return { finalPrice: 0, originalPrice: 0, hasDiscount: false };
    }

    const rules = await getCommissionRules();
    const campaigns = await getActiveCampaigns();
    
    // 1. Find the correct commission rule
    const ruleType = platform === 'personal' ? 'personalized-retail' : 'corporate-bulk';
    const rule = rules.find(r => r.categoryName === product.category && r.type === ruleType);

    // 2. Calculate the buffer
    let buffer = 0;
    if (rule) {
        if (rule.bufferType === 'fixed') {
            buffer = rule.bufferValue;
        } else {
            buffer = basePrice * (rule.bufferValue / 100);
        }
    }

    const originalPrice = basePrice + buffer;
    let finalPrice = originalPrice;
    let discountText = '';
    let hasDiscount = false;
    let appliedCampaignId: string | undefined = undefined;

    // 3. Check for applicable campaigns
    // This logic is simplified. A real app would have more complex discount rules.
    const productCampaign = campaigns.find(c => 
        c.type.toLowerCase().includes('sale') && // Only consider 'Sale' or 'Flash Sale'
        (c as any).associatedProducts?.includes(product.id) // Fictional field for demo
    );
    
    // Let's assume a mock discount for demo purposes
    if (productCampaign) {
        hasDiscount = true;
        appliedCampaignId = productCampaign.id;
        // Mock 10% discount for demo
        finalPrice = originalPrice * 0.90;
        discountText = '10% OFF';
    } else if (product.featured) { // Example: Apply 15% discount to all featured items
         hasDiscount = true;
         finalPrice = originalPrice * 0.85;
         discountText = 'SAVE 15%';
    }


    return {
        finalPrice,
        originalPrice,
        hasDiscount,
        discountText,
        appliedCampaignId,
    };
}
