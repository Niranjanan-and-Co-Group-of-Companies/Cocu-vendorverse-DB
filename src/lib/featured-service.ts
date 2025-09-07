
import { collection, onSnapshot, getDocs, doc, setDoc, updateDoc, deleteDoc, writeBatch, query, where, documentId, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';

export interface FeaturedProduct extends Product {
  featuredOnPersonal: boolean;
  featuredOnCorporate: boolean;
  b2bEnabled: boolean; // To know if the corporate toggle should be enabled
}

export interface ProductSearchResult {
    id: number;
    name: string;
    type: 'product' | 'vendor';
    image?: string;
    vendorName?: string;
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
export async function toggleFeaturedPlatform(productId: number, platform: 'personal' | 'corporate') {
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
export async function addFeatured(productId: number) {
  const docRef = doc(featuredCollection, String(productId));
  await setDoc(docRef, {
    featuredOnPersonal: true, // Default to true on personal
    featuredOnCorporate: false,
  });
}

// Remove a product from the featured list entirely
export async function removeFeatured(productId: number) {
  const docRef = doc(featuredCollection, String(productId));
  await deleteDoc(docRef);
}

// Search for products and vendors to feature
export async function searchProductsAndVendors(searchQuery: string): Promise<ProductSearchResult[]> {
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    // In a real app with a proper search index (like Algolia or Elasticsearch), this would be a single API call.
    // For now, we'll do two separate queries and merge. This is not efficient for large datasets.

    // Product search
    const productQuery = query(
        productsCollection,
        where('name', '>=', lowerCaseQuery),
        where('name', '<=', lowerCaseQuery + '\uf8ff'),
        limit(5)
    );

    // Vendor search (assuming vendors have their own collection)
    const vendorsCollection = collection(db, 'vendors');
     const vendorQuery = query(
        vendorsCollection,
        where('name', '>=', lowerCaseQuery),
        where('name', '<=', lowerCaseQuery + '\uf8ff'),
        limit(3)
    );
    
    const [productSnap, vendorSnap] = await Promise.all([getDocs(productQuery), getDocs(vendorsCollection)]);

    const productResults: ProductSearchResult[] = productSnap.docs
        .filter(doc => doc.data().name.toLowerCase().includes(lowerCaseQuery))
        .map(doc => {
            const data = doc.data() as Product;
            return {
                id: data.id,
                name: data.name,
                type: 'product',
                image: data.image,
                vendorName: data.vendor,
            };
    });

    const vendorResults: ProductSearchResult[] = vendorSnap.docs
        .filter(doc => doc.data().name.toLowerCase().includes(lowerCaseQuery))
        .map(doc => {
            const data = doc.data();
            return {
                id: data.id, // This is not a product id, might need adjustment
                name: data.name,
                type: 'vendor'
            };
    });

    // In this simplified version, we'll just return product results
    // A full implementation would handle selecting a vendor and then showing their products.
    return productResults;
}

// Ensure the `b2bEnabled` property is added to the Product interface for this page to work correctly
// This is a temporary measure until a proper B2B flag is added to the product data model.
declare module './products' {
  interface Product {
    b2bEnabled?: boolean;
  }
}
