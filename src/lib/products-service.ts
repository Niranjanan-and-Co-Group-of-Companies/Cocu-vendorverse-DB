

import { collection, getDocs, writeBatch, doc, onSnapshot, getDoc, query, where, limit, updateDoc, Unsubscribe, setDoc, addDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
import type { Product, ProductStatus, CustomizationSide, AllowedCustomizationType } from './products';
import type { Vendor } from '@/app/admin/vendors/page';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type ProductWithStatus = Product & { status: ProductStatus };
export type ProductWithVendor = Product & { vendor: Vendor };

const productsCollection = collection(db, 'products');

async function seedProductsIfEmpty() {
    const snapshot = await getDocs(query(productsCollection, limit(1)));
    if (snapshot.empty) {
        console.log("Products collection is empty. Seeding mock data...");
        const MOCK_PRODUCTS: Omit<Product, 'status' | 'vendorId'>[] = [
            { id: 1, name: 'Artisanal Chocolate Box', vendor: 'Gourmet Delights', price: '45.00', tieredPricing: [{ quantity: 50, price: '$42.00' }, { quantity: 100, price: '$40.00' }, { quantity: 250, price: '$38.00' }], image: 'https://picsum.photos/600/400?random=1', galleryImages: ['https://picsum.photos/600/400?random=11', 'https://picsum.photos/600/400?random=12', 'https://picsum.photos/600/400?random=13'], videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', rating: 4.8, stock: 25, moq: 50, customizable: true, featured: true, description: "A decadent assortment of handcrafted chocolates, perfect for any sweet tooth. Our chocolates are made with single-origin cacao beans and all-natural ingredients. Each box contains a variety of flavors, from classic dark chocolate to exotic fruit-infused truffles.", creatorStory: "Founded by a third-generation chocolatier, Gourmet Delights is dedicated to the art of fine chocolate making. We travel the world to source the best ingredients and honor traditional techniques.", category: "Food & Drink", customizationSides: { front: { image: 'https://picsum.photos/600/400?random=1', areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: ['Text', 'Image Upload'], weight: 1, dimensions: { l: 8, w: 6, h: 2 }, inventoryBuffer: 5, tags: ['chocolate', 'gourmet', 'gift box'], preparationTime: { min: 3, max: 4 }, preparationTimeUnit: 'days', },
            { id: 2, name: 'Luxury Spa Set', vendor: 'Serene Moments', price: '$85.00', image: 'https://picsum.photos/600/400?random=2', galleryImages: ['https://picsum.photos/600/400?random=21', 'https://picsum.photos/600/400?random=22'], rating: 4.9, stock: 5, moq: 10, customizable: false, featured: true, description: "A complete home-spa experience with bath bombs, lotions, and scented candles. This set is designed to help you relax, rejuvenate, and find your inner peace. All products are vegan and cruelty-free.", creatorStory: "Serene Moments was born from a desire to make self-care accessible to everyone. Our founder, a certified aromatherapist, personally formulates each product to ensure the highest quality and efficacy.", category: "Wellness", customizationSides: { front: { image: 'https://picsum.photos/600/400?random=2', areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 3, dimensions: { l: 10, w: 8, h: 4 }, inventoryBuffer: 2, tags: ['spa', 'wellness', 'self-care', 'bath'], preparationTime: { min: 2, max: 3 }, preparationTimeUnit: 'days', tieredPricing: [] },
            { id: 3, name: 'Handcrafted Leather Wallet', vendor: 'Heritage Wares', price: '$75.00', tieredPricing: [{ quantity: 25, price: '$70.00' }, { quantity: 50, price: '$65.00' }, { quantity: 100, price: '$60.00' }], image: 'https://picsum.photos/600/400?random=3', rating: 4.7, stock: 15, customizable: true, featured: true, category: "Fashion & Accessories", galleryImages: [], videoUrl: '', description: '', creatorStory: '', customizationSides: { front: { image: 'https://picsum.photos/600/400?random=3', areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: ['Text'], weight: 0.5, dimensions: { l: 4, w: 3, h: 0.5 }, inventoryBuffer: 3, tags: ['leather', 'wallet', 'monogram'], preparationTime: { min: 5, max: 6 }, preparationTimeUnit: 'days', moq: 25, },
            { id: 4, name: 'Gourmet Coffee Collection', vendor: 'The Daily Grind', price: '$55.00', image: 'https://picsum.photos/600/400?random=4', rating: 4.8, stock: 50, customizable: false, featured: true, category: "Food & Drink", galleryImages: [], videoUrl: '', description: '', creatorStory: '', customizationSides: { front: { image: 'https://picsum.photos/600/400?random=4', areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 2, dimensions: { l: 12, w: 9, h: 3 }, inventoryBuffer: 10, tags: ['coffee', 'beans', 'sampler'], preparationTime: { min: 1, max: 2 }, preparationTimeUnit: 'days', moq: 100, tieredPricing: [] },
            { id: 5, name: 'Exotic Tea Sampler', vendor: 'The Tea Leaf', price: '$40.00', image: 'https://picsum.photos/600/400?random=5', rating: 4.9, stock: 0, customizable: false, featured: true, category: "Food & Drink", galleryImages: [], videoUrl: '', description: '', creatorStory: '', customizationSides: { front: { image: 'https://picsum.photos/600/400?random=5', areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 1.5, dimensions: { l: 10, w: 7, h: 3 }, inventoryBuffer: 0, tags: ['tea', 'sampler', 'exotic'], preparationTime: { min: 2, max: 3 }, preparationTimeUnit: 'days', moq: 1, tieredPricing: [] },
            { id: 6, name: 'Custom Engraved Pen', vendor: 'Signature Gifts', price: '$95.00', tieredPricing: [{ quantity: 200, price: '$90.00' }, { quantity: 500, price: '$85.00' }], image: 'https://picsum.photos/600/400?random=6', rating: 4.6, stock: 100, customizable: true, featured: true, category: "Office & Corporate", galleryImages: [], videoUrl: '', description: '', creatorStory: '', customizationSides: { front: { image: 'https://picsum.photos/600/400?random=6', areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: ['Text'], weight: 0.2, dimensions: { l: 6, w: 0.5, h: 0.5 }, inventoryBuffer: 10, tags: ['pen', 'engraved', 'corporate'], preparationTime: { min: 3, max: 4 }, preparationTimeUnit: 'days', moq: 200, },
            { id: 7, name: 'Smart Water Bottle', vendor: 'Techie Gifts', price: '$60.00', image: 'https://picsum.photos/600/400?random=7', rating: 4.5, stock: 30, customizable: false, featured: false, category: "Tech", galleryImages: [], videoUrl: '', description: '', creatorStory: '', customizationSides: { front: { image: 'https://picsum.photos/600/400?random=7', areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 1, dimensions: { l: 10, w: 3, h: 3 }, inventoryBuffer: 5, tags: ['tech', 'smart', 'water bottle'], preparationTime: { min: 1, max: 2 }, preparationTimeUnit: 'days', moq: 100, tieredPricing: [] },
            { id: 8, name: 'Personalized Star Map', vendor: 'Cosmic Prints', price: '$50.00', image: 'https://picsum.photos/600/400?random=8', rating: 4.9, stock: 100, customizable: true, featured: false, category: "Home & Decor", galleryImages: [], videoUrl: '', description: '', creatorStory: '', customizationSides: { front: { image: 'https://picsum.photos/600/400?random=8', areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: ['Text'], weight: 2, dimensions: { l: 24, w: 18, h: 0.1 }, inventoryBuffer: 10, tags: ['stars', 'map', 'personalized', 'astronomy'], preparationTime: { min: 3, max: 4 }, preparationTimeUnit: 'days', moq: 1, tieredPricing: [] },
        ];
        const VENDOR_MAP: { [key: string]: string } = { 'Gourmet Delights': 'vendor001', 'Serene Moments': 'vendor002', 'Heritage Wares': 'vendor003', 'The Daily Grind': 'vendor004', 'The Tea Leaf': 'vendor005', 'Signature Gifts': 'vendor006', 'Techie Gifts': 'vendor007', 'Cosmic Prints': 'vendor008' };
        const batch = writeBatch(db);
        let lastId = 0;
        MOCK_PRODUCTS.forEach((product) => {
            const docId = String(product.id);
            const docRef = doc(db, 'products', docId);
            const vendorId = VENDOR_MAP[product.vendor] || 'unknown_vendor';
            batch.set(docRef, { ...product, status: 'Live', vendorId });
            lastId = product.id;
        });
        const productsCounterRef = doc(db, 'counters', 'products');
        batch.set(productsCounterRef, { lastId: lastId });
        await batch.commit();
        console.log("Products seeded.");
    }
}
seedProductsIfEmpty();


async function uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

export async function saveProduct(
    productData: Partial<Product>, 
    sideImageFiles: Record<CustomizationSide, File | null>,
    galleryImageFiles: File[]
) {
    let productId = productData.id;

    // Get a new product ID if creating
    if (!productId) {
        const counterRef = doc(db, 'counters', 'products');
        const counterSnap = await getDoc(counterRef);
        const newId = (counterSnap.data()?.lastId || 0) + 1;
        productId = newId;
        await setDoc(counterRef, { lastId: newId });
    }

    const finalProductData = { ...productData, id: productId };

    // Initialize customizationSides if it's missing
    if (!finalProductData.customizationSides) {
        finalProductData.customizationSides = { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } };
    }

    // Upload side images and update URLs
    for (const [side, file] of Object.entries(sideImageFiles)) {
        if (file) {
            const imageUrl = await uploadFile(`products/${productId}/side_${side}_${file.name}`, file);
            finalProductData.customizationSides[side as CustomizationSide] = {
                ...(finalProductData.customizationSides[side as CustomizationSide] || { areas: [] }),
                image: imageUrl
            };
        }
    }
    
    // Upload gallery images
    const galleryImageUrls = await Promise.all(
        galleryImageFiles.map(file => uploadFile(`products/${productId}/gallery_${Date.now()}_${file.name}`, file))
    );

    // Combine existing URLs (if any) with new ones
    finalProductData.galleryImages = [...(finalProductData.galleryImages || []), ...galleryImageUrls];
    
    // The main 'image' field for the product should be the 'front' image
    finalProductData.image = finalProductData.customizationSides.front?.image || finalProductData.galleryImages[0] || 'https://placehold.co/600x400';

    const docRef = doc(db, 'products', String(productId));
    await setDoc(docRef, finalProductData, { merge: true });
    return productId;
}


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
    if (!category || currentProductId === undefined) return [];
    
    const q = query(
        productsCollection, 
        where('category', '==', category),
        limit(5) // Get a few more to filter out the current one
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => doc.data() as Product)
        .filter(p => p.id !== currentProductId)
        .slice(0, 4);
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

export async function updateProductInventory(productId: number, stock: number, inventoryBuffer: number) {
    const productRef = doc(db, 'products', String(productId));
    await updateDoc(productRef, { stock, inventoryBuffer });
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
