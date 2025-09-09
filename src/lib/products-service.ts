

'use server';

import { collection, getDocs, writeBatch, doc, getDoc, query, where, limit, updateDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from './firebase';
import type { Product, ProductStatus, CustomizationSide, AllowedCustomizationType, ProductVariant } from './products';
import type { Vendor } from './vendors-service';
import { getVendorById } from './vendors-service';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const productsCollection = collection(db, 'products');

async function seedProductsIfEmpty() {
    const seedFlagRef = doc(db, 'internal_flags', 'productsSeeded_v2');
    const seedFlagSnap = await getDoc(seedFlagRef);

    if (seedFlagSnap.exists()) {
        return; // Seeding already performed.
    }
    
    console.log("Products collection seems empty or unseeded. Seeding mock data...");
    
    const MOCK_PRODUCTS: Omit<Product, 'id' | 'status' | 'vendorId' | 'shipsFromPincode' | 'createdAt' | 'updatedAt' | 'mainVariantId'>[] = [
        { name: 'Artisanal Chocolate Box', vendor: 'Gourmet Delights', price: '45.00', tieredPricing: [{ quantity: 50, price: '$42.00' }, { quantity: 100, price: '$40.00' }, { quantity: 250, price: '$38.00' }], image: 'https://picsum.photos/600/400?random=1', galleryImages: ['https://picsum.photos/600/400?random=11', 'https://picsum.photos/600/400?random=12', 'https://picsum.photos/600/400?random=13'], videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', rating: 4.8, stock: 25, moq: 50, customizable: true, featured: true, description: "A decadent assortment of handcrafted chocolates, perfect for any sweet tooth. Our chocolates are made with single-origin cacao beans and all-natural ingredients. Each box contains a variety of flavors, from classic dark chocolate to exotic fruit-infused truffles.", creatorStory: "Founded by a third-generation chocolatier, Gourmet Delights is dedicated to the art of fine chocolate making. We travel the world to source the best ingredients and honor traditional techniques.", category: "Food & Drink", customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], allowedCustomizations: ['Text', 'Image Upload'], packaging: { weight: 1000, dimensions: { l: 8, w: 6, h: 2 } }, inventoryBuffer: 5, tags: ['chocolate', 'gourmet', 'gift box'], preparationTime: 4, platform: 'Personalized', sku: 'GD-CHOC-01', hsnSac: '1806', taxRate: 18, mrp: 55, vendorSP: 45, platformBufferRate: 5, vendorCommissionRate: 15, name_lowercase: 'artisanal chocolate box', customizationSides: { front: { image: null }, back: { image: null }, left: { image: null }, right: { image: null }, top: { image: null }, bottom: { image: null } } },
        { name: 'Luxury Spa Set', vendor: 'Serene Moments', price: '$85.00', image: 'https://picsum.photos/600/400?random=2', galleryImages: ['https://picsum.photos/600/400?random=21', 'https://picsum.photos/600/400?random=22'], rating: 4.9, stock: 5, moq: 10, customizable: false, featured: true, description: "A complete home-spa experience with bath bombs, lotions, and scented candles. This set is designed to help you relax, rejuvenate, and find your inner peace. All products are vegan and cruelty-free.", creatorStory: "Serene Moments was born from a desire to make self-care accessible to everyone. Our founder, a certified aromatherapist, personally formulates each product to ensure the highest quality and efficacy.", category: "Wellness", customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], allowedCustomizations: [], packaging: { weight: 3000, dimensions: { l: 10, w: 8, h: 4 } }, inventoryBuffer: 2, tags: ['spa', 'wellness', 'self-care', 'bath'], preparationTime: 3, tieredPricing: [], platform: 'Personalized', sku: '', hsnSac: '', taxRate: 0, mrp: 0, vendorSP: 0, platformBufferRate: 0, vendorCommissionRate: 0, name_lowercase: 'luxury spa set', customizationSides: { front: { image: null }, back: { image: null }, left: { image: null }, right: { image: null }, top: { image: null }, bottom: { image: null } } },
        { name: 'Handcrafted Leather Wallet', vendor: 'Heritage Wares', price: '$75.00', tieredPricing: [{ quantity: 25, price: '$70.00' }, { quantity: 50, price: '$65.00' }, { quantity: 100, price: '$60.00' }], image: 'https://picsum.photos/600/400?random=3', rating: 4.7, stock: 15, customizable: true, featured: true, category: "Fashion & Accessories", galleryImages: [], videoUrl: '', description: '', creatorStory: '', customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], allowedCustomizations: ['Text'], packaging: { weight: 500, dimensions: { l: 4, w: 3, h: 0.5 } }, inventoryBuffer: 3, tags: ['leather', 'wallet', 'monogram'], preparationTime: 6, moq: 25, platform: 'Corporate', sku: 'HW-WLT-01', hsnSac: '4202', taxRate: 18, mrp: 85, vendorSP: 75, platformBufferRate: 5, vendorCommissionRate: 15, name_lowercase: 'handcrafted leather wallet', customizationSides: { front: { image: null }, back: { image: null }, left: { image: null }, right: { image: null }, top: { image: null }, bottom: { image: null } } },
    ];
    const VENDOR_MAP: { [key: string]: { id: string, pincode: string } } = { 
        'Gourmet Delights': { id: 'vendor001', pincode: '400001'},
        'Serene Moments': { id: 'vendor002', pincode: '560001'},
        'Heritage Wares': { id: 'vendor003', pincode: '302001'},
    };
    const batch = writeBatch(db);
    MOCK_PRODUCTS.forEach((product) => {
        const docRef = doc(productsCollection); // Auto-generate ID
        const vendorInfo = VENDOR_MAP[product.vendor] || { id: 'unknown_vendor', pincode: '000000' };
        batch.set(docRef, { 
            ...product, 
            id: docRef.id,
            name_lowercase: product.name.toLowerCase(),
            status: 'Live', 
            vendorId: vendorInfo.id,
            shipsFromPincode: vendorInfo.pincode,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            mainVariantId: null,
        });
    });
    await batch.commit();
    await setDoc(seedFlagRef, { seeded: true, at: serverTimestamp() });
    console.log(`${MOCK_PRODUCTS.length} products seeded.`);
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
    const docRef = isNewProduct ? doc(productsCollection) : doc(productsCollection, productData.id!);
    const productId = docRef.id;
    
    // Get Vendor Pincode
    const vendor = await getVendorById(productData.vendorId!);
    const shipsFromPincode = vendor?.pickupAddresses?.[0]?.pincode || '000000';

    const finalProductData = { 
        ...productData, 
        id: productId, 
        name_lowercase: productData.name?.toLowerCase(),
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
    
    await setDoc(docRef, finalProductData, { merge: true });
    return productId;
}


export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map((doc) => ({...doc.data()} as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Product;
    }
    return null;
}

export async function getRelatedProducts(type: 'category' | 'vendor', value?: string, currentProductId?: string): Promise<Product[]> {
    if (!value || currentProductId === undefined) return [];

    let q;
    if (type === 'category') {
        q = query(
            productsCollection, 
            where('category', '==', value),
            where('status', '==', 'Live'),
            limit(10)
        );
    } else { // type === 'vendor'
        q = query(
            productsCollection, 
            where('vendorId', '==', value),
            where('status', '==', 'Live'),
            limit(10)
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => doc.data() as Product)
        .filter(p => String(p.id) !== currentProductId) // Ensure we don't show the current product
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

export async function updateProductStatus(productId: string, status: ProductStatus) {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, { status: status, updatedAt: serverTimestamp() });
}

export async function updateProductInventory(productId: number, stock: number, inventoryBuffer: number) {
    const productRef = doc(db, 'products', String(productId));
    await updateDoc(productRef, { stock, inventoryBuffer, updatedAt: serverTimestamp() });
}

export async function approveProduct(productId: string) {
    await updateProductStatus(String(productId), 'Live');
}

export async function declineProduct(productId: string) {
    await updateProductStatus(String(productId), 'Declined');
}
