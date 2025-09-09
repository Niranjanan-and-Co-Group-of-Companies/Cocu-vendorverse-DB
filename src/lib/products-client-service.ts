
'use client';

import { collection, onSnapshot, doc, query, where, Unsubscribe, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, ProductStatus } from './products';
import type { Vendor } from './vendors-service';
import { getVendorById } from './vendors-service';

export type ProductWithStatus = Product & { status: ProductStatus };
export type ProductWithVendor = Product & { vendor: Vendor };

const productsCollection = collection(db, 'products');

export function onProductUpdate(id: string, callback: (product: Product | null) => void): () => void {
    const docRef = doc(db, 'products', id);
    return onSnapshot(docRef, (doc) => {
        callback(doc.exists() ? doc.data() as Product : null);
    });
}

export function onVendorProductsUpdate(vendorId: string, callback: (products: ProductWithStatus[]) => void): Unsubscribe {
    const q = query(productsCollection, where('vendorId', '==', vendorId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => doc.data() as ProductWithStatus);
        callback(products);
    });

    return unsubscribe;
}

export function onPendingProductsUpdate(callback: (products: ProductWithVendor[]) => void): Unsubscribe {
    const q = query(productsCollection, where('status', '==', 'Pending Review'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const vendorCache = new Map<string, Vendor>();

        const getVendor = async (vendorId: string): Promise<Vendor> => {
            if (vendorCache.has(vendorId)) return vendorCache.get(vendorId)!;
            
            const vendorData = await getVendorById(vendorId);
            if (vendorData) {
                 vendorCache.set(vendorId, vendorData);
                 return vendorData;
            }
            return { id: vendorId, name: 'Unknown Vendor', email: '', phone: '', avatar: '', status: 'Active', joinedDate: null, pickupAddresses: [], gstProfile: { gstin: '', legalName: '', stateCode: '' }, banking: { beneficiary: '', ifsc: '', accountNoMasked: '' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'customer' }, kyc: { currentStep: 1, status: 'Not Started', panStatus: 'Not Submitted', bankAccountStatus: 'Not Submitted', addressProofStatus: 'Not Submitted', gstinStatus: 'Not Submitted' } };
        }

        const productsPromises = snapshot.docs.map(async (doc) => {
            const productData = doc.data() as Product;
            const vendor = await getVendor(productData.vendorId);
            return { ...productData, vendor };
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
