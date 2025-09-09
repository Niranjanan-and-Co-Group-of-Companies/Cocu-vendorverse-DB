

import { collection, onSnapshot, getDocs, writeBatch, doc, updateDoc, deleteDoc, query, where, Unsubscribe, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product } from './products';
import type { CommissionRule } from './commissions-service';

export type CategoryPlatform = 'Personalized' | 'Corporate' | 'Both';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
  platform: CategoryPlatform;
  commissionRate?: number; // Added to hold the relevant commission rate
}

async function seedCategories() {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);
    if (snapshot.empty) {
        console.log("Seeding categories...");
        const batch = writeBatch(db);
        const mockCategories = [
            { name: "Food & Drink", image: "https://picsum.photos/seed/food/400/300", platform: 'Both' },
            { name: "Wellness", image: "https://picsum.photos/seed/wellness/400/300", platform: 'Both' },
            { name: "Fashion & Accessories", image: "https://picsum.photos/seed/fashion/400/300", platform: 'Both' },
            { name: "Office & Corporate", image: "https://picsum.photos/seed/office/400/300", platform: 'Corporate' },
            { name: "Tech", image: "https://picsum.photos/seed/tech/400/300", platform: 'Both' },
            { name: "Home & Decor", image: "https://picsum.photos/seed/home/400/300", platform: 'Both' },
            { name: "Made by Sunshine", image: "https://picsum.photos/seed/sunshine/400/300", platform: 'Personalized' },
            { name: "Other", image: "https://picsum.photos/seed/other/400/300", platform: 'Both' },
        ];
        mockCategories.forEach(cat => {
            const docRef = doc(categoriesRef);
            batch.set(docRef, { 
                name: cat.name, 
                image: cat.image,
                platform: cat.platform,
                slug: cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
            });
        });
        await batch.commit();
    }
}


// Get product count for a single category
export function getProductCountForCategory(categoryName: string, callback: (count: number) => void): Unsubscribe {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('category', '==', categoryName));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });

  return unsubscribe;
}

// Upload image and get URL
async function uploadCategoryImage(file: File): Promise<string> {
    const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}


// --- Main Service Functions ---

// Get all categories with real-time updates
export function onCategoriesUpdate(callback: (categories: Category[]) => void): Unsubscribe {
    const categoriesRef = collection(db, 'categories');
    
    seedCategories();

    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
        const categoriesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Category));
        callback(categoriesData);
    });

    return unsubscribe;
}


// Add a new category
export async function addCategory(categoryData: { name: string, platform: CategoryPlatform, imageFile?: File | null }) {
    const { name, platform, imageFile } = categoryData;
    let imageUrl = `https://picsum.photos/seed/${name.toLowerCase()}/400/300`; // Default image

    if (imageFile) {
        imageUrl = await uploadCategoryImage(imageFile);
    }
    
    await addDoc(collection(db, 'categories'), {
        name,
        slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        platform,
        image: imageUrl,
    });
}

// Update an existing category
export async function updateCategory(categoryId: string, categoryData: { name: string, platform: CategoryPlatform, imageFile?: File | null }) {
    const { name, platform, imageFile } = categoryData;
    const docRef = doc(db, 'categories', categoryId);
    
    const updateData: Partial<Category> = {
        name,
        platform,
        slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
    };

    if (imageFile) {
        updateData.image = await uploadCategoryImage(imageFile);
    }

    await updateDoc(docRef, updateData);
}

// Delete a category
export async function deleteCategory(categoryId: string) {
    const docRef = doc(db, 'categories', categoryId);
    await deleteDoc(docRef);
}

// --- Real-time Combined Fetching ---

export function onCategoriesWithCommissionsUpdate(platform: CategoryPlatform | 'Both' | 'Personalized' | 'Corporate', callback: (categories: Category[]) => void): Unsubscribe {
    seedCategories(); // Ensure categories exist

    const categoriesRef = collection(db, 'categories');
    let categoriesQuery;
    if (platform && platform !== 'Both') {
        categoriesQuery = query(categoriesRef, where('platform', 'in', ['Both', platform]));
    } else {
        categoriesQuery = query(categoriesRef);
    }
    
    const commissionsRef = collection(db, 'commissions');

    let cachedCategories: Category[] = [];
    let cachedCommissions: CommissionRule[] = [];

    const updateCombinedData = () => {
        const commissionType = platform === 'Corporate' ? 'corporate-bulk' : 'personalized-retail';
        const commissionRulesMap = new Map<string, number>();

        cachedCommissions
            .filter(rule => rule.type === commissionType)
            .forEach(rule => {
                commissionRulesMap.set(rule.categoryName, rule.commissionRate);
            });

        const combined = cachedCategories.map(category => ({
            ...category,
            commissionRate: commissionRulesMap.get(category.name) ?? 0,
        }));
        
        callback(combined);
    };

    const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
        cachedCategories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        updateCombinedData();
    });

    const unsubCommissions = onSnapshot(commissionsRef, (snapshot) => {
        cachedCommissions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommissionRule));
        updateCombinedData();
    });

    return () => {
        unsubCategories();
        unsubCommissions();
    };
}


// --- Functions from previous implementation, kept for compatibility ---

export async function getCategories(platform?: CategoryPlatform): Promise<Category[]> {
    await seedCategories();

    // 1. Fetch all categories that are relevant
    const categoriesRef = collection(db, 'categories');
    let categoriesQuery;
    if (platform && platform !== 'Both') {
        categoriesQuery = query(categoriesRef, where('platform', 'in', ['Both', platform]));
    } else {
        categoriesQuery = query(categoriesRef);
    }
    const categoriesSnapshot = await getDocs(categoriesQuery);
    const categories: Category[] = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

    // 2. Fetch all commission rules
    const commissionType = platform === 'Corporate' ? 'corporate-bulk' : 'personalized-retail';
    const commissionsRef = collection(db, 'commissions');
    const commissionsQuery = query(commissionsRef, where('type', '==', commissionType));
    const commissionsSnapshot = await getDocs(commissionsQuery);
    const commissionRulesMap = new Map<string, number>();
    if (!commissionsSnapshot.empty) {
        commissionsSnapshot.forEach(doc => {
            const rule = doc.data() as CommissionRule;
            commissionRulesMap.set(rule.categoryName, rule.commissionRate);
        });
    }

    // 3. Merge commission rates into categories
    const categoriesWithCommissions = categories.map(category => ({
        ...category,
        commissionRate: commissionRulesMap.get(category.name) ?? 0 // Default to 0 if no rule found
    }));

    return categoriesWithCommissions;
}


export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const q = query(collection(db, 'categories'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as Category;
}

export async function getCategoryByName(name?: string): Promise<Category | null> {
    if (!name) return null;
    const q = query(collection(db, 'categories'), where('name', '==', name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const docData = snapshot.docs[0];
    const commissionType = (docData.data().platform === 'Corporate' || docData.data().platform === 'Both') ? 'corporate-bulk' : 'personalized-retail';
    
    const commissionsQuery = query(collection(db, 'commissions'), where('categoryName', '==', name), where('type', '==', commissionType));
    const commissionsSnapshot = await getDocs(commissionsQuery);

    let commissionRate = 0;
    if (!commissionsSnapshot.empty) {
        commissionRate = (commissionsSnapshot.docs[0].data() as CommissionRule).commissionRate;
    }
    
    return { id: docData.id, ...docData.data(), commissionRate } as Category;
}


export async function getProductsByCategory(slug: string): Promise<Product[]> {
    const category = await getCategoryBySlug(slug);
    if (!category) {
        return [];
    }
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('category', '==', category.name));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Product);
}
