

import { collection, onSnapshot, getDocs, writeBatch, doc, updateDoc, deleteDoc, query, where, Unsubscribe, addDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product } from './products';
import type { CommissionRule } from './commissions-service';

export type CategoryPlatform = 'Personalized' | 'Corporate';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
  platform: CategoryPlatform;
  commissionRate?: number; // Added to hold the relevant commission rate
}

const MOCK_CATEGORIES = [
    { name: "Food & Drink", image: "https://picsum.photos/seed/food/400/300", platform: 'Personalized' },
    { name: "Wellness", image: "https://picsum.photos/seed/wellness/400/300", platform: 'Personalized' },
    { name: "Fashion & Accessories", image: "https://picsum.photos/seed/fashion/400/300", platform: 'Personalized' },
    { name: "Tech", image: "https://picsum.photos/seed/tech/400/300", platform: 'Personalized' },
    { name: "Home & Decor", image: "https://picsum.photos/seed/home/400/300", platform: 'Personalized' },
    { name: "Made by Sunshine", image: "https://picsum.photos/seed/sunshine/400/300", platform: 'Personalized' },
    { name: "Other", image: "https://picsum.photos/seed/other/400/300", platform: 'Personalized' },
    // Corporate Categories
    { name: "Office & Corporate", image: "https://picsum.photos/seed/office/400/300", platform: 'Corporate' },
    { name: "Bulk Apparel", image: "https://picsum.photos/seed/apparel/400/300", platform: 'Corporate' },
    { name: "Promotional Tech", image: "https://picsum.photos/seed/promotech/400/300", platform: 'Corporate' },
];


async function seedCategories() {
    // This function will now ensure the database matches the mock data definition.
    if (sessionStorage.getItem('categoriesSeeded')) {
        return;
    }
    
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    const existingCategories = new Map(snapshot.docs.map(doc => [doc.data().name, doc.id]));
    const batch = writeBatch(db);
    let changesMade = false;

    // Add missing categories
    for (const cat of MOCK_CATEGORIES) {
        if (!existingCategories.has(cat.name)) {
            const docRef = doc(categoriesRef);
            batch.set(docRef, {
                ...cat,
                slug: cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
            });
            changesMade = true;
            console.log(`Seeding new category: ${cat.name}`);
        }
    }
    
    if (changesMade) {
        await batch.commit();
        console.log("Category seeding complete.");
    }
    
    sessionStorage.setItem('categoriesSeeded', 'true');
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
    const q = query(categoriesRef, orderBy('name', 'asc')); // Order by name alphabetically
    
    seedCategories();

    const unsubscribe = onSnapshot(q, (snapshot) => {
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

export function onCategoriesWithCommissionsUpdate(platform: 'Personalized' | 'Corporate', callback: (categories: Category[]) => void): Unsubscribe {
    seedCategories(); // Ensure categories exist

    const categoriesRef = collection(db, 'categories');
    const categoriesQuery = query(categoriesRef, where('platform', '==', platform));
    
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
        
        callback(combined.sort((a, b) => a.name.localeCompare(b.name)));
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

    const categoriesRef = collection(db, 'categories');
    let categoriesQuery;

    if (platform) {
        categoriesQuery = query(categoriesRef, where('platform', '==', platform));
    } else {
        categoriesQuery = query(categoriesRef);
    }
    
    const categoriesSnapshot = await getDocs(categoriesQuery);
    const categories: Category[] = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    
    return categories.sort((a, b) => a.name.localeCompare(b.name));
}


export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    await seedCategories();
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
    await seedCategories();
    const q = query(collection(db, 'categories'), where('name', '==', name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const docData = snapshot.docs[0];
    const commissionType = (docData.data().platform === 'Corporate') ? 'corporate-bulk' : 'personalized-retail';
    
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
