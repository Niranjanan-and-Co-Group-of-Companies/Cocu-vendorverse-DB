

import { collection, onSnapshot, getDocs, doc, setDoc, updateDoc, deleteDoc, writeBatch, query, where, documentId, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';

export interface FeaturedProduct extends Product {
  featuredOnPersonal: boolean;
  featuredOnCorporate: boolean;
  b2bEnabled: boolean; // To know if the corporate toggle should be enabled
}

const featuredCollection = collection(db, 'featured');
const productsCollection = collection(db, 'products');

async function getFeaturedProductsByPlatform(platform: 'personal' | 'corporate'): Promise<FeaturedProduct[]> {
  const field = platform === 'personal' ? 'featuredOnPersonal' : 'featuredOnCorporate';
  const q = query(featuredCollection, where(field, '==', true));
  const featuredSnapshot = await getDocs(q);

  const featuredDocs = featuredSnapshot.docs;
    if (featuredDocs.length === 0) {
      return [];
    }

    const featuredMap = new Map(featuredDocs.map(d => [d.id, d.data()]));
    const productIds = featuredDocs.map(d => d.id);

    const productBatches: Promise<any>[] = [];
    for (let i = 0; i < productIds.length; i += 30) {
      const batchIds = productIds.slice(i, i + 30);
      const productQuery = query(productsCollection, where(documentId(), 'in', batchIds));
      productBatches.push(getDocs(productQuery));
    }

    const productSnapshots = await Promise.all(productBatches);
    
    const mergedProducts: FeaturedProduct[] = [];
    productSnapshots.forEach(productSnapshot => {
        productSnapshot.docs.forEach((productDoc: any) => {
            const productData = productDoc.data() as Product;
            const featureData = featuredMap.get(productDoc.id);

            if (featureData) {
                mergedProducts.push({
                    ...productData,
                    featuredOnPersonal: featureData.featuredOnPersonal || false,
                    featuredOnCorporate: featureData.featuredOnCorporate || false,
                    b2bEnabled: !!productData.customizable,
                });
            }
        });
    });
    return mergedProducts;
}

export async function getFeaturedCorporateProducts(): Promise<FeaturedProduct[]> {
    return getFeaturedProductsByPlatform('corporate');
}

export async function getFeaturedPersonalProducts(): Promise<FeaturedProduct[]> {
    return getFeaturedProductsByPlatform('personal');
}


// Get all featured products with real-time updates and merged product data
export function onFeaturedProductsUpdate(callback: (products: FeaturedProduct[]) => void): () => void {
  const unsubscribe = onSnapshot(featuredCollection, async (featuredSnapshot) => {
    const featuredDocs = featuredSnapshot.docs;
    if (featuredDocs.length === 0) {
      callback([]);
      return;
    }

    const featuredMap = new Map(featuredDocs.map(d => [d.id, d.data()]));
    const productIds = featuredDocs.map(d => d.id);

    // Fetch the corresponding products from the 'products' collection
    // Firestore 'in' queries are limited to 30 items. For more, batching is needed.
    const productBatches: Promise<any>[] = [];
    for (let i = 0; i < productIds.length; i += 30) {
      const batchIds = productIds.slice(i, i + 30);
      const q = query(productsCollection, where(documentId(), 'in', batchIds));
      productBatches.push(getDocs(q));
    }

    const productSnapshots = await Promise.all(productBatches);
    
    const mergedProducts: FeaturedProduct[] = [];
    productSnapshots.forEach(productSnapshot => {
        productSnapshot.docs.forEach((productDoc: any) => {
            const productData = productDoc.data() as Product;
            const featureData = featuredMap.get(productDoc.id);

            if (featureData) {
                mergedProducts.push({
                    ...productData,
                    featuredOnPersonal: featureData.featuredOnPersonal || false,
                    featuredOnCorporate: featureData.featuredOnCorporate || false,
                    b2bEnabled: !!productData.customizable, // Mock logic for b2b-enabled
                });
            }
        });
    });
    callback(mergedProducts);
  });

  return unsubscribe;
}

// Toggle a product's featured status on a specific platform
export async function toggleFeaturedPlatform(productId: string, platform: 'personal' | 'corporate') {
  const docRef = doc(featuredCollection, String(productId));
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const currentStatus = docSnap.data()[platform === 'personal' ? 'featuredOnPersonal' : 'featuredOnCorporate'];
  const fieldToUpdate = platform === 'personal' ? 'featuredOnPersonal' : 'featuredOnCorporate';
  
  await updateDoc(docRef, {
    [fieldToUpdate]: !currentStatus,
  });
}

// Add a product to the featured list
export async function addFeatured(productId: string) {
  const docRef = doc(featuredCollection, String(productId));
  await setDoc(docRef, {
    featuredOnPersonal: true, // Default to true on personal
    featuredOnCorporate: false,
  });
}

// Remove a product from the featured list entirely
export async function removeFeatured(productId: string) {
  const docRef = doc(featuredCollection, String(productId));
  await deleteDoc(docRef);
}


// Ensure the `b2bEnabled` property is added to the Product interface for this page to work correctly
// This is a temporary measure until a proper B2B flag is added to the product data model.
declare module './products' {
  interface Product {
    b2bEnabled?: boolean;
  }
}
