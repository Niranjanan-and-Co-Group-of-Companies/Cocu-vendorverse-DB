import { collection, getDocs, doc, onSnapshot, query, where, writeBatch, Unsubscribe, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product } from './products';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number; // Make optional as it will be calculated separately
}

// Seed initial categories if the collection is empty
const MOCK_CATEGORIES = [
    { name: "Food & Drink", slug: "food-drink" },
    { name: "Wellness", slug: "wellness" },
    { name: "Fashion & Accessories", slug: "fashion-accessories" },
    { name: "Office & Corporate", slug: "office-corporate" },
    { name: "Tech", slug: "tech" },
    { name: "Home & Decor", slug: "home-decor" },
];

let hasSeeded = false;

async function seedCategories() {
  if (hasSeeded) return;
  const categoriesRef = collection(db, "categories");
  const snapshot = await getDocs(categoriesRef);
  if (snapshot.empty) {
    console.log("Seeding initial categories...");
    const batch = writeBatch(db);
    MOCK_CATEGORIES.forEach(category => {
      const docRef = doc(categoriesRef);
      // Use picsum for initial placeholder images
      const imageUrl = `https://picsum.photos/seed/${category.slug}/400/300`;
      batch.set(docRef, { ...category, image: imageUrl });
    });
    await batch.commit();
    console.log("Categories seeded.");
  }
  hasSeeded = true; // Prevent re-seeding in the same session
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
    
    // Seed data if needed, then set up listener
    seedCategories().then(() => {
        onSnapshot(categoriesRef, (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Category));
            callback(categoriesData);
        });
    });
    
    // Return a dummy unsubscribe function as the listener is long-lived
    return () => console.log("Categories listener detached.");
}

// Add a new category
export async function addCategory(categoryData: { name: string, imageFile?: File }) {
    const { name, imageFile } = categoryData;
    let imageUrl = `https://picsum.photos/seed/${name}/400/300`; // Default image

    if (imageFile) {
        imageUrl = await uploadCategoryImage(imageFile);
    }
    
    await addDoc(collection(db, 'categories'), {
        name,
        slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        image: imageUrl,
    });
}

// Update an existing category
export async function updateCategory(categoryId: string, categoryData: { name: string, imageFile?: File }) {
    const { name, imageFile } = categoryData;
    const docRef = doc(db, 'categories', categoryId);
    
    const updateData: { name: string, slug: string, image?: string } = {
        name,
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
// In a real app, these should be deprecated and removed over time.

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, 'categories'));
   if (snapshot.empty) {
    await seedCategories();
    const seededSnapshot = await getDocs(collection(db, 'categories'));
    return seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  }
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