

import { collection, getDocs, doc, onSnapshot, query, where, writeBatch, Unsubscribe, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product } from './products';

export type CategoryPlatform = 'Personalized' | 'Corporate' | 'Both';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number; // Make optional as it will be calculated separately
  platform: CategoryPlatform;
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
// This is now called from onCategoriesUpdate to ensure it runs when needed.


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
    
    // Seed data if the collection is empty.
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

// --- Functions from previous implementation, kept for compatibility ---

export async function getCategories(platform?: CategoryPlatform): Promise<Category[]> {
  await seedCategories();
  const categoriesRef = collection(db, 'categories');
  let q = query(categoriesRef);

  if (platform && platform !== 'Both') {
      q = query(categoriesRef, where('platform', 'in', ['Both', platform]));
  } else if (!platform) {
      // Default to personal if no platform specified on general pages
       q = query(categoriesRef, where('platform', 'in', ['Both', 'Personalized']));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
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
    return { id: docData.id, ...docData.data() } as Category;
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
