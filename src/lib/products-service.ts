

'use server';

import { collection, getDocs, writeBatch, doc, getDoc, query, where, limit, updateDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from './firebase';
import type { Product, ProductStatus, CustomizationSide, AllowedCustomizationType, ProductVariant, Platform } from './products';
import type { Vendor } from './vendors-service';
import { getVendorById } from './vendors-service';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCategoryByName } from './categories-service';
import { calculateDisplayPrice } from './pricing-service';
import type { CommissionRule } from './commissions-service';
import { makePlain } from './utils';
import { generateSeoMetadata } from '@/ai/flows/generate-seo-flow';

export type PlainProduct = Omit<Product, 'createdAt' | 'updatedAt' | 'variants'> & {
  createdAt: string | null;
  updatedAt: string | null;
  variants: (Omit<ProductVariant, 'customizationSides'> & {
      customizationSides: Record<CustomizationSide, { image: string | null }>;
  })[];
};

export async function serializeProduct(product: Product): Promise<PlainProduct> {
  const plainProduct = makePlain(product);

  // Ensure Timestamps are converted to ISO strings
  if (plainProduct.createdAt && typeof plainProduct.createdAt === 'object' && 'seconds' in plainProduct.createdAt) {
    plainProduct.createdAt = new Date(plainProduct.createdAt.seconds * 1000).toISOString();
  }
  if (plainProduct.updatedAt && typeof plainProduct.updatedAt === 'object' && 'seconds' in plainProduct.updatedAt) {
    plainProduct.updatedAt = new Date(plainProduct.updatedAt.seconds * 1000).toISOString();
  }
  
  return plainProduct as PlainProduct;
}

const productsCollection = collection(db, 'products');

async function seedProductsIfEmpty() {
    const seedFlagRef = doc(db, 'internal_flags', 'productsSeeded_v23'); 
    const seedFlagSnap = await getDoc(seedFlagRef);

    if (seedFlagSnap.exists()) {
        return; // The correct seeding has already been performed.
    }
    
    console.log("Performing one-time product database hard reset (v23)...");
    
    // Hard reset logic: Delete all existing products first.
    const existingProductsSnapshot = await getDocs(productsCollection);
    if (existingProductsSnapshot.size > 0) {
        const deleteBatch = writeBatch(db);
        existingProductsSnapshot.docs.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
        console.log(`Deleted ${existingProductsSnapshot.size} old products.`);
    }


    const MOCK_PRODUCTS_RAW = [
        { name: 'Artisanal Chocolate Box', vendor: 'Gourmet Delights', vendorSP: 450.00, image: 'https://picsum.photos/seed/choco/600/400', galleryImages: ['https://picsum.photos/seed/choco1/600/400', 'https://picsum.photos/seed/choco2/600/400', 'https://picsum.photos/seed/choco3/600/400'], videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', rating: 4.8, stock: 25, customizable: true, featured: true, description: "A decadent assortment of handcrafted chocolates, perfect for any sweet tooth. Our chocolates are made with single-origin cacao beans and all-natural ingredients. Each box contains a variety of flavors, from classic dark chocolate to exotic fruit-infused truffles.", category: "Food & Drink", platform: 'Personalized', hasVariants: true },
        { name: 'Luxury Spa Set', vendor: 'Serene Moments', vendorSP: 850.00, image: 'https://picsum.photos/seed/spa/600/400', galleryImages: ['https://picsum.photos/seed/spa1/600/400', 'https://picsum.photos/seed/spa2/600/400'], rating: 4.9, stock: 5, customizable: false, featured: true, description: "A complete home-spa experience with bath bombs, lotions, and scented candles. This set is designed to help you relax, rejuvenate, and find your inner peace. All products are vegan and cruelty-free.", category: "Wellness", platform: 'Personalized', hasVariants: false },
        { name: 'Handcrafted Leather Wallet', vendor: 'Heritage Wares', vendorSP: 750.00, tieredPricing: [{ quantity: 25, price: '700.00' }, { quantity: 50, price: '650.00' }, { quantity: 100, price: '600.00' }], image: 'https://picsum.photos/seed/wallet/600/400', rating: 4.7, stock: 15, customizable: true, featured: false, category: "Office & Corporate", moq: 25, platform: 'Corporate', hasVariants: true},
        { name: 'Gourmet Coffee Collection', vendor: 'The Daily Grind', vendorSP: 600.00, image: 'https://picsum.photos/seed/coffee/600/400', rating: 4.6, stock: 30, customizable: false, featured: false, description: "Explore the world of coffee with our curated collection of single-origin beans.", category: "Food & Drink", platform: 'Personalized', hasVariants: false, preparationTime: { min: 1, max: 2 } },
        { name: 'Aromatherapy Diffuser', vendor: 'Serene Moments', vendorSP: 1200.00, image: 'https://picsum.photos/seed/diffuser/600/400', rating: 4.8, stock: 20, customizable: false, featured: false, description: "An ultrasonic diffuser that mists essential oils for aromatherapy and relaxation.", category: "Wellness", platform: 'Personalized', hasVariants: false },
    ];
    
    const VENDOR_MAP: { [key: string]: { id: string, pincode: string } } = { 
        'Gourmet Delights': { id: 'vendor001', pincode: '400001'},
        'Serene Moments': { id: 'vendor002', pincode: '560001'},
        'Heritage Wares': { id: 'vendor003', pincode: '302001'},
        'The Daily Grind': { id: 'vendor004', pincode: '577101'}
    };
    
    const seedBatch = writeBatch(db);
    for (const product of MOCK_PRODUCTS_RAW) {
        const docRef = doc(productsCollection);
        const vendorInfo = VENDOR_MAP[product.vendor] || { id: 'unknown_vendor', pincode: '000000' };
        
        const platform = product.platform as 'Personalized' | 'Corporate';
        
        const fullProductData: Product = {
            ...product,
            price: product.vendorSP.toFixed(2), // Price is now directly the vendorSP
            vendorSP: product.vendorSP,
            id: docRef.id,
            name_lowercase: product.name.toLowerCase(),
            status: 'Live', 
            vendorId: vendorInfo.id,
            shipsFromPincode: vendorInfo.pincode,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            mainVariantId: 'variant_1', // Default main variant
            categorySlug: product.category?.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'),
            customizationAreas: { front: [{ id: 'area1', type: 'rect', x: 50, y: 50, width: 200, height: 100, rotation: 0 }], back: [], left: [], right: [], top: [], bottom: [] },
            variants: [
                { id: 'variant_1', colorName: 'Default', colorHex: '#FFFFFF', image: product.image, customizationSides: { front: { image: product.image }, back: { image: 'https://picsum.photos/seed/chocoback/600/400' }, left: { image: null }, right: { image: null }, top: { image: null }, bottom: { image: null } }, galleryImages: product.galleryImages },
                { id: 'variant_2', colorName: 'Dark', colorHex: '#362222', image: 'https://picsum.photos/seed/chocodark/600/400', customizationSides: { front: { image: 'https://picsum.photos/seed/chocodark/600/400' }, back: { image: null }, left: { image: null }, right: { image: null }, top: { image: null }, bottom: { image: null } }, galleryImages: [] },
            ],
            allowedCustomizations: ['Text', 'Image Upload', 'Clipart', 'AI Image'],
            inventoryBuffer: 5,
            tags: ['gourmet', 'gift box', 'luxury'],
            packaging: { weight: 1, dimensions: { l: 10, w: 10, h: 5 } },
            preparationTime: product.preparationTime || { min: 3, max: 4 },
            preparationTimeUnit: 'days',
            sku: `${product.vendor.substring(0,2).toUpperCase()}-${docRef.id.substring(0,4)}`,
            hsnSac: '9505',
            taxRate: 18,
            mrp: product.vendorSP * 1.5,
            platformBufferRate: 0,
            vendorCommissionRate: 0,
        };

        seedBatch.set(docRef, fullProductData);
    }
    await seedBatch.commit();
    
    await setDoc(seedFlagRef, { seeded: true, at: serverTimestamp() });
    console.log(`${MOCK_PRODUCTS_RAW.length} products seeded successfully (v23). This operation will not run again.`);
}


async function uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

export async function saveProduct(
    productData: Partial<Product>, 
    imageFilesByVariant: Record<string, Record<CustomizationSide, File | null>>,
    galleryImageFilesByVariant: Record<string, File[]>
) {
    const isNewProduct = !productData.id;
    const docRef = isNewProduct ? doc(productsCollection) : doc(productsCollection, productData.id!);
    const productId = docRef.id;
    
    const vendor = await getVendorById(productData.vendorId!);
    const shipsFromPincode = vendor?.pickupAddresses?.[0]?.pincode || '000000';

    const categorySlug = productData.category ? productData.category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-') : '';

    // The price from the form IS the definitive vendor selling price.
    const vendorSP = parseFloat(productData.price || '0');
    
    const finalProductData = { 
        ...productData, 
        id: productId, 
        price: vendorSP.toFixed(2), // Ensure price is a string with 2 decimal places
        vendorSP: vendorSP,
        name_lowercase: productData.name?.toLowerCase(),
        shipsFromPincode,
        categorySlug,
        updatedAt: serverTimestamp(),
        ...(isNewProduct && { createdAt: serverTimestamp() })
    };
    
    if (finalProductData.variants) {
        for (const variant of finalProductData.variants) {
            const variantImageFiles = imageFilesByVariant[variant.id] || {};
            const variantGalleryFiles = galleryImageFilesByVariant[variant.id] || [];

            // Upload customization side images
            for (const [side, file] of Object.entries(variantImageFiles)) {
                if (file) {
                    const imageUrl = await uploadFile(`products/${productId}/variant_${variant.id}_${side}_${file.name}`, file);
                    variant.customizationSides[side as CustomizationSide] = {
                       ...(variant.customizationSides[side as CustomizationSide]),
                        image: imageUrl
                    };
                    if (side === 'front') {
                        variant.image = imageUrl; // Set main variant image if front is uploaded
                    }
                }
            }

            // Upload variant-specific gallery images
            if (variantGalleryFiles.length > 0) {
                const galleryUrls = await Promise.all(
                    variantGalleryFiles.map(file => 
                        uploadFile(`products/${productId}/gallery_${variant.id}_${Date.now()}_${file.name}`, file)
                    )
                );
                variant.galleryImages = [...(variant.galleryImages || []), ...galleryUrls];
            }
             // If this variant is the main one and it has no primary image, set it from its gallery
            if (!variant.image && variant.galleryImages && variant.galleryImages.length > 0) {
                variant.image = variant.galleryImages[0];
            }
        }
    }
    
    const mainVariant = finalProductData.variants?.find(v => v.id === finalProductData.mainVariantId) 
                        || finalProductData.variants?.[0];

    // Set top-level product image based on the main variant
    finalProductData.image = mainVariant?.image || 'https://placehold.co/600x400';
    
     // Generate SEO metadata if the product is being published
    if (finalProductData.status === 'Live' || finalProductData.status === 'Pending Review') {
        const seoData = await generateSeoMetadata({
            productName: finalProductData.name!,
            description: finalProductData.description!,
            category: finalProductData.category!,
        });
        Object.assign(finalProductData, seoData);
    }
    
    await setDoc(docRef, finalProductData, { merge: true });
    return productId;
}


export async function getAllProducts(): Promise<PlainProduct[]> {
  const snapshot = await getDocs(productsCollection);
  const products = snapshot.docs.map((doc) => ({ ...doc.data() } as Product));
  return Promise.all(products.map(serializeProduct));
}

export async function getProductsByVendor(vendorId: string): Promise<PlainProduct[]> {
    const q = query(productsCollection, where('vendorId', '==', vendorId));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => doc.data() as Product);
    return await Promise.all(products.map(serializeProduct));
}

export async function getProductById(id: string): Promise<PlainProduct | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const product = docSnap.data() as Product;
        return await serializeProduct(product);
    }
    return null;
}

export async function getRelatedProducts(type: 'category' | 'vendor', value?: string, currentProductId?: string): Promise<PlainProduct[]> {
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
    const products = snapshot.docs
        .map(doc => doc.data() as Product)
        .filter(p => String(p.id) !== currentProductId)
        .slice(0, 4);
    
    return await Promise.all(products.map(serializeProduct));
}


export interface SearchIndex {
    name: string;
    category?: string;
    vendor: string;
}

export async function getSearchIndex(platform: Platform): Promise<SearchIndex[]> {
    const platformFilter = platform === 'Corporate' ? ['Corporate', 'Both'] : ['Personalized', 'Both'];
    const q = query(productsCollection, where('platform', 'in', platformFilter));
    const snapshot = await getDocs(q);
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

export async function updateProductInventory(productId: string, stock: number, inventoryBuffer: number) {
    const productRef = doc(db, 'products', String(productId));
    await updateDoc(productRef, { stock, inventoryBuffer, updatedAt: serverTimestamp() });
}

export async function approveProduct(productId: string) {
    await updateProductStatus(String(productId), 'Live');
}

export async function declineProduct(productId: string) {
    await updateProductStatus(String(productId), 'Declined');
}




