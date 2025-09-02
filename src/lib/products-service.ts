
import { collection, getDocs, writeBatch, doc, onSnapshot, getDoc, query, where, limit, updateDoc, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, ProductStatus } from './products';
import type { Vendor } from '@/app/admin/vendors/page';

export type ProductWithStatus = Product & { status: ProductStatus };
export type ProductWithVendor = Product & { vendor: Vendor };

const MOCK_PRODUCTS: Omit<Product, 'status' | 'vendorId'>[] = [
    {
    id: 1,
    name: 'Artisanal Chocolate Box',
    vendor: 'Gourmet Delights',
    price: '$45.00',
    image: 'https://picsum.photos/600/400?random=1',
    galleryImages: ['https://picsum.photos/600/400?random=11', 'https://picsum.photos/600/400?random=12', 'https://picsum.photos/600/400?random=13'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 4.8,
    stock: 25,
    customizable: true,
    featured: true,
    description: "A decadent assortment of handcrafted chocolates, perfect for any sweet tooth. Our chocolates are made with single-origin cacao beans and all-natural ingredients. Each box contains a variety of flavors, from classic dark chocolate to exotic fruit-infused truffles.",
    creatorStory: "Founded by a third-generation chocolatier, Gourmet Delights is dedicated to the art of fine chocolate making. We travel the world to source the best ingredients and honor traditional techniques.",
    category: "Food & Drink",
  },
  {
    id: 2,
    name: 'Luxury Spa Set',
    vendor: 'Serene Moments',
    price: '$85.00',
    image: 'https://picsum.photos/600/400?random=2',
    galleryImages: ['https://picsum.photos/600/400?random=21', 'https://picsum.photos/600/400?random=22'],
    rating: 4.9,
    stock: 5,
    customizable: false,
    featured: true,
    description: "A complete home-spa experience with bath bombs, lotions, and scented candles. This set is designed to help you relax, rejuvenate, and find your inner peace. All products are vegan and cruelty-free.",
    creatorStory: "Serene Moments was born from a desire to make self-care accessible to everyone. Our founder, a certified aromatherapist, personally formulates each product to ensure the highest quality and efficacy.",
    category: "Wellness",
  },
  {
    id: 3,
    name: 'Handcrafted Leather Wallet',
    vendor: 'Heritage Wares',
    price: '$75.00',
    image: 'https://picsum.photos/600/400?random=3',
    rating: 4.7,
    stock: 15,
    customizable: true,
    featured: true,
    description: "A timeless and durable wallet made from full-grain leather, with custom monogram options. This wallet is designed to last a lifetime and will develop a beautiful patina over time.",
    category: "Fashion & Accessories",
  },
  {
    id: 4,
    name: 'Gourmet Coffee Collection',
    vendor: 'The Daily Grind',
    price: '$55.00',
    image: 'https://picsum.photos/600/400?random=4',
    rating: 4.8,
    stock: 50,
    customizable: false,
    featured: true,
    description: "A selection of single-origin coffee beans from around the world. This collection includes beans from Ethiopia, Colombia, and Sumatra, each with its own unique flavor profile.",
    category: "Food & Drink",
  },
  {
    id: 5,
    name: 'Exotic Tea Sampler',
    vendor: 'The Tea Leaf',
    price: '$40.00',
    image: 'https://picsum.photos/600/400?random=5',
    rating: 4.9,
    stock: 0,
    customizable: false,
    featured: true,
    description: "Explore a variety of rare and exotic teas in this beautifully packaged sampler. A perfect gift for any tea lover.",
    category: "Food & Drink",
  },
  {
    id: 6,
    name: 'Custom Engraved Pen',
    vendor: 'Signature Gifts',
    price: '$95.00',
    image: 'https://picsum.photos/600/400?random=6',
    rating: 4.6,
    stock: 100,
    customizable: true,
    featured: true,
    description: "A sophisticated writing instrument that can be engraved with a name or message.",
    category: "Office & Corporate",
  },
  {
    id: 7,
    name: 'Smart Water Bottle',
    vendor: 'Techie Gifts',
    price: '$60.00',
    image: 'https://picsum.photos/600/400?random=7',
    rating: 4.5,
    stock: 30,
    customizable: false,
    featured: false,
    description: "A bottle that tracks your water intake and glows to remind you to hydrate.",
    category: "Tech",
  },
  {
    id: 8,
    name: 'Personalized Star Map',
    vendor: 'Cosmic Prints',
    price: '$50.00',
    image: 'https://picsum.photos/600/400?random=8',
    rating: 4.9,
    stock: 100,
    customizable: true,
    featured: false,
    description: "A map of the stars on a specific date, like an anniversary or birthday.",
    category: "Home & Decor",
  },
];


const productsCollection = collection(db, 'products');

const VENDOR_MAP: { [key: string]: string } = {
  'Gourmet Delights': 'vendor001',
  'Serene Moments': 'vendor002',
  'Heritage Wares': 'vendor003',
  'The Daily Grind': 'vendor004',
  'The Tea Leaf': 'vendor005',
  'Signature Gifts': 'vendor006',
  'Techie Gifts': 'vendor007',
  'Cosmic Prints': 'vendor008'
};

async function seedProducts() {
  const snapshot = await getDocs(productsCollection);
  if (snapshot.empty) {
    const batch = writeBatch(db);
    MOCK_PRODUCTS.forEach((product) => {
        const docRef = doc(db, 'products', String(product.id));
        const vendorId = VENDOR_MAP[product.vendor] || 'unknown_vendor';
        batch.set(docRef, { ...product, status: 'Live', vendorId });
    });
    await batch.commit();
  }
}

seedProducts();

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map((doc) => doc.data() as Product);
}

export async function getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Product;
    }
    return null;
}

export function onProductUpdate(id: string, callback: (product: Product | null) => void): () => void {
    const docRef = doc(db, 'products', id);
    return onSnapshot(docRef, (doc) => {
        callback(doc.exists() ? doc.data() as Product : null);
    });
}

export async function getRelatedProducts(category?: string, currentProductId?: number): Promise<Product[]> {
    if (!category) return [];
    
    const q = query(
        productsCollection, 
        where('category', '==', category),
        where('id', '!=', currentProductId), // Exclude the current product
        limit(4)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Product);
}


export interface SearchIndex {
    name: string;
    category?: string;
    vendor: string;
}

export async function getSearchIndex(): Promise<SearchIndex[]> {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.name,
            category: data.category,
            vendor: data.vendor,
        }
    });
}

// ---- New Functions for Vendor Product Management ----

export function onVendorProductsUpdate(vendorId: string, callback: (products: ProductWithStatus[]) => void): Unsubscribe {
    const q = query(productsCollection, where('vendorId', '==', vendorId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => doc.data() as ProductWithStatus);
        callback(products);
    });

    return unsubscribe;
}

export async function updateProductStatus(productId: number, status: ProductStatus) {
    const productRef = doc(db, 'products', String(productId));
    await updateDoc(productRef, { status });
}


// ---- New Functions for Admin Product Approval ----

export function onPendingProductsUpdate(callback: (products: ProductWithVendor[]) => void): Unsubscribe {
    const q = query(productsCollection, where('status', '==', 'Pending Review'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const vendorCache = new Map<string, Vendor>();

        const getVendor = async (vendorId: string): Promise<Vendor> => {
            if (vendorCache.has(vendorId)) return vendorCache.get(vendorId)!;

            const vendorRef = doc(db, 'vendors', vendorId);
            const vendorSnap = await getDoc(vendorRef);
            if (vendorSnap.exists()) {
                const vendorData = { id: vendorSnap.id, ...vendorSnap.data() } as Vendor;
                vendorCache.set(vendorId, vendorData);
                return vendorData;
            }
            // Fallback for unknown vendor
            return { id: vendorId, name: 'Unknown Vendor', email: '', avatar: '', status: 'Active', joinedDate: null };
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


export async function approveProduct(productId: number) {
    await updateProductStatus(productId, 'Live');
}

export async function declineProduct(productId: number) {
    await updateProductStatus(productId, 'Declined');
}
