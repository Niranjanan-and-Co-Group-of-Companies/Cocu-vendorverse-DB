

'use client';

import { collection, onSnapshot, doc, query, where, Unsubscribe, limit, getDocs, orderBy, documentId } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, ProductStatus } from './products';
import type { PlainVendor } from './vendors-service';
import { getVendorById } from './vendors-service';
import { onCategoriesWithCommissionsUpdate, type Category } from './categories-service';
import { calculateDisplayPrice, type DisplayPrice } from './pricing-service';
import { getFeaturedPersonalProducts, getFeaturedCorporateProducts, type FeaturedProduct } from './featured-service';
import { serializeProduct } from './products-service';

export type ProductWithStatus = Product & { status: ProductStatus };
export type ProductWithVendor = Product & { vendor: PlainVendor };
export type ProductWithPrice = Product & FeaturedProduct & { displayPrice: DisplayPrice };

export function onProductUpdate(id: string, callback: (product: Product | null) => void): () => void {
    const docRef = doc(db, 'products', id);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const product = { id: doc.id, ...doc.data() } as Product;
            callback(serializeProduct(product));
        } else {
            callback(null);
        }
    });
}

export function onProductsUpdate(productIds: string[], callback: (products: Product[]) => void): Unsubscribe {
    if (productIds.length === 0) {
        callback([]);
        return () => {};
    }
    const q = query(collection(db, 'products'), where(documentId(), 'in', productIds));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => {
            const product = { id: doc.id, ...doc.data() } as Product;
            return serializeProduct(product);
        });
        callback(products);
    });
    return unsubscribe;
}


export function onVendorProductsUpdate(vendorId: string, callback: (products: ProductWithStatus[]) => void): Unsubscribe {
    const q = query(productsCollection, where('vendorId', '==', vendorId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => {
            const product = {id: doc.id, ...doc.data()} as Product;
            return serializeProduct(product);
        });
        callback(products as ProductWithStatus[]);
    });

    return unsubscribe;
}

export function onPendingProductsUpdate(callback: (products: ProductWithVendor[]) => void): Unsubscribe {
    const q = query(productsCollection, where('status', '==', 'Pending Review'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const vendorCache = new Map<string, PlainVendor>();

        const getVendor = async (vendorId: string): Promise<PlainVendor> => {
            if (vendorCache.has(vendorId)) return vendorCache.get(vendorId)!;
            
            const vendorData = await getVendorById(vendorId);
            if (vendorData) {
                 vendorCache.set(vendorId, vendorData);
                 return vendorData;
            }
            // Fallback for missing vendor data
            return { id: vendorId, name: 'Unknown Vendor', email: '', phone: '', avatar: '', status: 'Active', joinedDate: null, pickupAddresses: [], gstProfile: { gstin: '', legalName: '', stateCode: '' }, banking: { beneficiary: '', ifsc: '', accountNoMasked: '' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'customer'}, kyc: { currentStep: 1, status: 'Not Started', panStatus: 'Not Submitted', bankAccountStatus: 'Not Submitted', addressProofStatus: 'Not Submitted', gstinStatus: 'Not Submitted' } } as unknown as PlainVendor;
        }

        const productsPromises = snapshot.docs.map(async (doc) => {
            const productData = { id: doc.id, ...doc.data() } as Product;
            const vendor = await getVendor(productData.vendorId);
            return { ...serializeProduct(productData), vendor } as ProductWithVendor;
        });

        const products = await Promise.all(productsPromises);
        callback(products);
    });

    return unsubscribe;
}

export function getPendingProductCount(callback: (count: number) => void): Unsubscribe {
  const q = query(productsCollection, where('status', '==', 'Pending Review'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
  return unsubscribe;
}

// ---- Functions for customer-facing pages ----

const productsCollection = collection(db, 'products');

async function priceProducts(products: (Product & Partial<FeaturedProduct>)[], platform: 'Personalized' | 'Corporate', categories: Category[]): Promise<ProductWithPrice[]> {
    const pricedProducts = await Promise.all(
        products.map(async (p) => {
            const category = categories.find(c => c.name === p.category);
            const productInfo = {
                id: p.id,
                vendorSP: p.vendorSP,
                category: p.category,
                vendorId: p.vendorId,
                discountType: p.discountType,
                discountValue: p.discountValue,
                price: p.price,
                tieredPricing: p.tieredPricing,
            };
            return {
                ...p,
                featuredOnPersonal: p.featuredOnPersonal ?? false,
                featuredOnCorporate: p.featuredOnCorporate ?? false,
                displayPrice: await calculateDisplayPrice(productInfo, platform, category || undefined),
            } as ProductWithPrice;
        })
    );
    return pricedProducts;
}

export function onFeaturedProductsUpdate(
    platform: 'Personalized' | 'Corporate',
    callback: (products: ProductWithPrice[]) => void
): Unsubscribe {
    const fetcher = platform === 'Corporate' ? getFeaturedCorporateProducts : getFeaturedPersonalProducts;

    let unsubCategories: Unsubscribe | null = null;
    let unsubProducts: Unsubscribe | null = null;
    let productCache: (Product & Partial<FeaturedProduct>)[] = [];
    let categoryCache: Category[] = [];

    const combineAndCallback = async () => {
        if(productCache.length > 0 && categoryCache.length > 0) {
            const priced = await priceProducts(productCache, platform, categoryCache);
            callback(priced);
        }
    }

    unsubCategories = onCategoriesWithCommissionsUpdate(platform, (categories) => {
        categoryCache = categories;
        if(productCache.length > 0) {
            combineAndCallback();
        }
    });

    const setupProductListener = async () => {
        const featuredProductsInitial = await fetcher();
        productCache = featuredProductsInitial;
        combineAndCallback();
        
        const productIds = featuredProductsInitial.map(p => p.id);

        if (productIds.length > 0) {
            const q = query(productsCollection, where(documentId(), 'in', productIds));
            unsubProducts = onSnapshot(q, (snapshot) => {
                const updatedProducts = snapshot.docs.map(doc => {
                    const existingData = productCache.find(p => p.id === doc.id);
                    return {
                        ...(serializeProduct({ id: doc.id, ...doc.data() } as Product)),
                        featuredOnPersonal: existingData?.featuredOnPersonal,
                        featuredOnCorporate: existingData?.featuredOnCorporate,
                    };
                });
                productCache = updatedProducts;
                combineAndCallback();
            });
        } else {
            callback([]);
        }
    };

    setupProductListener();
    
    return () => {
        unsubCategories?.();
        unsubProducts?.();
    };
}


export function onProductsByCategoryUpdate(
    slug: string,
    platform: 'Personalized' | 'Corporate',
    callback: (products: ProductWithPrice[], category: Category | null) => void
): Unsubscribe {
    let unsubCategories: Unsubscribe | null = null;
    let unsubProducts: Unsubscribe | null = null;
    
    const q = query(productsCollection, where('categorySlug', '==', slug), where('status', '==', 'Live'));

    unsubCategories = onCategoriesWithCommissionsUpdate(platform, (categories) => {
        const currentCategory = categories.find(c => c.slug === slug) || null;

        if (unsubProducts) unsubProducts(); // Unsubscribe from previous listener

        unsubProducts = onSnapshot(q, async (snapshot) => {
            const products = snapshot.docs.map(doc => serializeProduct({ id: doc.id, ...doc.data() } as Product));
            const priced = await priceProducts(products, platform, categories);
            callback(priced, currentCategory);
        });
    });

    return () => {
        unsubCategories?.();
        unsubProducts?.();
    };
}

export function onAllProductsUpdate(
    platform: 'Personalized' | 'Corporate',
    callback: (products: ProductWithPrice[]) => void
): Unsubscribe {
    let unsubCategories: Unsubscribe | null = null;
    let unsubProducts: Unsubscribe | null = null;
    
    const q = query(productsCollection, where('status', '==', 'Live'));

    unsubCategories = onCategoriesWithCommissionsUpdate(platform, (categories) => {
        if (unsubProducts) unsubProducts(); // Unsubscribe from previous listener

        unsubProducts = onSnapshot(q, async (snapshot) => {
            const products = snapshot.docs.map(doc => serializeProduct({ id: doc.id, ...doc.data() } as Product));
            const platformFiltered = platform === 'Corporate' 
                ? products.filter(p => p.moq && p.moq > 0)
                : products;
            
            const priced = await priceProducts(platformFiltered, platform, categories);
            callback(priced);
        });
    });

    return () => {
        unsubCategories?.();
        unsubProducts?.();
    };
}
