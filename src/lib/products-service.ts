

import { collection, getDocs, writeBatch, doc, onSnapshot, getDoc, query, where, limit, updateDoc, Unsubscribe, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from './firebase';
import type { Product, ProductStatus, CustomizationSide, AllowedCustomizationType, ProductVariant } from './products';
import type { Vendor } from './vendors-service';
import { getVendorById } from './vendors-service';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type ProductWithStatus = Product & { status: ProductStatus };
export type ProductWithVendor = Product & { vendor: Vendor };

const productsCollection = collection(db, 'products');

async function seedProductsIfEmpty() {
    const counterRef = doc(db, 'counters', 'products');
    const counterSnap = await getDoc(counterRef);

    if (!counterSnap.exists()) {
        console.log("Products counter not found. Seeding mock data...");
        const MOCK_PRODUCTS: Omit<Product, 'status' | 'vendorId' | 'shipsFromPincode' | 'createdAt' | 'updatedAt' | 'mainVariantId'>[] = [
            { id: 1, name: 'Artisanal Chocolate Box', vendor: 'Gourmet Delights', price: '45.00', tieredPricing: [{ quantity: 50, price: '$42.00' }, { quantity: 100, price: '$40.00' }, { quantity: 250, price: '$38.00' }], image: 'https://picsum.photos/600/400?random=1', galleryImages: ['https://picsum.photos/600/400?random=11', 'https://picsum.photos/600/400?random=12', 'https://picsum.photos/600/400?random=13'], videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', rating: 4.8, stock: 25, moq: 50, customizable: true, featured: true, description: "A decadent assortment of handcrafted chocolates, perfect for any sweet tooth. Our chocolates are made with single-origin cacao beans and all-natural ingredients. Each box contains a variety of flavors, from classic dark chocolate to exotic fruit-infused truffles.", creatorStory: "Founded by a third-generation chocolatier, Gourmet Delights is dedicated to the art of fine chocolate making. We travel the world to source the best ingredients and honor traditional techniques.", category: "Food & Drink", customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], allowedCustomizations: ['Text', 'Image Upload'], weight: 1, dimensions: { l: 8, w: 6, h: 2 }, inventoryBuffer: 5, tags: ['chocolate', 'gourmet', 'gift box'], preparationTime: { min: 3, max: 4 }, preparationTimeUnit: 'days', platform: 'Personalized' },
            { id: 2, name: 'Luxury Spa Set', vendor: 'Serene Moments', price: '$85.00', image: 'https://picsum.photos/600/400?random=2', galleryImages: ['https://picsum.photos/600/400?random=21', 'https://picsum.photos/600/400?random=22'], rating: 4.9, stock: 5, moq: 10, customizable: false, featured: true, description: "A complete home-spa experience with bath bombs, lotions, and scented candles. This set is designed to help you relax, rejuvenate, and find your inner peace. All products are vegan and cruelty-free.", creatorStory: "Serene Moments was born from a desire to make self-care accessible to everyone. Our founder, a certified aromatherapist, personally formulates each product to ensure the highest quality and efficacy.", category: "Wellness", customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], allowedCustomizations: [], weight: 3, dimensions: { l: 10, w: 8, h: 4 }, inventoryBuffer: 2, tags: ['spa', 'wellness', 'self-care', 'bath'], preparationTime: { min: 2, max: 3 }, preparationTimeUnit: 'days', tieredPricing: [], platform: 'Personalized' },
            { id: 3, name: 'Handcrafted Leather Wallet', vendor: 'Heritage Wares', price: '$75.00', tieredPricing: [{ quantity: 25, price: '$70.00' }, { quantity: 50, price: '$65.00' }, { quantity: 100, price: '$60.00' }], image: 'https://picsum.photos/600/400?random=3', rating: 4.7, stock: 15, customizable: true, featured: true, category: "Fashion & Accessories", galleryImages: [], videoUrl: '', description: '', creatorStory: '', customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], allowedCustomizations: ['Text'], weight: 0.5, dimensions: { l: 4, w: 3, h: 0.5 }, inventoryBuffer: 3, tags: ['leather', 'wallet', 'monogram'], preparationTime: { min: 5, max: 6 }, preparationTimeUnit: 'days', moq: 25, platform: 'Corporate' },
        ];
        const VENDOR_MAP: { [key: string]: { id: string, pincode: string } } = { 
            'Gourmet Delights': { id: 'vendor001', pincode: '400001'},
            'Serene Moments': { id: 'vendor002', pincode: '560001'},
            'Heritage Wares': { id: 'vendor003', pincode: '302001'},
        };
        const batch = writeBatch(db);
        let lastId = 0;
        MOCK_PRODUCTS.forEach((product) => {
            const docId = String(product.id);
            const docRef = doc(db, 'products', docId);
            const vendorInfo = VENDOR_MAP[product.vendor] || { id: 'unknown_vendor', pincode: '000000' };
            batch.set(docRef, { 
                ...product, 
                status: 'Live', 
                vendorId: vendorInfo.id,
                shipsFromPincode: vendorInfo.pincode,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                mainVariantId: product.variants?.[0]?.id || null,
            });
            lastId = product.id;
        });
        batch.set(counterRef, { lastId: lastId });
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
    imageFilesByVariant: Record<string, Record<CustomizationSide, File | null>>,
    galleryImageFiles: File[]
) {
    const isNewProduct = !productData.id;
    let productId = productData.id;
    
    // Get Vendor Pincode
    const vendor = await getVendorById(productData.vendorId!);
    const shipsFromPincode = vendor?.address.pincode || '000000';

    if (isNewProduct) {
        const counterRef = doc(db, 'counters', 'products');
        const counterSnap = await getDoc(counterRef);
        const newId = (counterSnap.data()?.lastId || 0) + 1;
        productId = newId;
        await setDoc(counterRef, { lastId: newId });
    }

    const finalProductData = { 
        ...productData, 
        id: productId, 
        shipsFromPincode,
        updatedAt: serverTimestamp(),
        ...(isNewProduct && { createdAt: serverTimestamp() })
    };
    
    // Process variants
    if (finalProductData.variants) {
        for (const variant of finalProductData.variants) {
            const variantImageFiles = imageFilesByVariant[variant.id] || {};

            for (const [side, file] of Object.entries(variantImageFiles)) {
                if (file) {
                    const imageUrl = await uploadFile(`products/${productId}/variant_${variant.id}_${side}_${file.name}`, file);
                    if (isNewProduct || !variant.customizationSides[side as CustomizationSide]?.image) {
                        variant.customizationSides[side as CustomizationSide] = {
                           ...(variant.customizationSides[side as CustomizationSide]),
                            image: imageUrl
                        };
                    }
                    if (side === 'front') {
                        variant.image = imageUrl;
                    }
                }
            }
        }
    }

    const galleryImageUrls = await Promise.all(
        galleryImageFiles.map(file => uploadFile(`products/${productId}/gallery_${Date.now()}_${file.name}`, file))
    );

    finalProductData.galleryImages = [...(finalProductData.galleryImages || []), ...galleryImageUrls];
    
    const mainVariant = finalProductData.variants?.find(v => v.id === finalProductData.mainVariantId) 
                        || finalProductData.variants?.[0];

    if (finalProductData.customizable) {
        finalProductData.image = mainVariant?.customizationSides.front?.image || mainVariant?.image || finalProductData.galleryImages?.[0] || 'https://placehold.co/600x400';
    } else {
        finalProductData.image = mainVariant?.image || finalProductData.galleryImages?.[0] || 'https://placehold.co/600x400';
    }
    
    const docRef = doc(db, 'products', String(productId));
    await setDoc(docRef, finalProductData, { merge: true });
    return productId;
}


export async function getAllProducts(): Promise<Product[]> {
  await seedProductsIfEmpty();
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
        limit(10)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => doc.data() as Product)
        .filter(p => p.id !== currentProductId) // Ensure we don't show the current product
        .slice(0, 4); // Slice to a max of 4 results
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
    await updateDoc(productRef, { status: status, updatedAt: serverTimestamp() });
}

export async function updateProductInventory(productId: number, stock: number, inventoryBuffer: number) {
    const productRef = doc(db, 'products', String(productId));
    await updateDoc(productRef, { stock, inventoryBuffer, updatedAt: serverTimestamp() });
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
            return { id: vendorId, name: 'Unknown Vendor', email: '', phone: '', avatar: '', status: 'Active', joinedDate: null, address: { street: '', city: '', state: '', pincode: '', country: ''} };
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
