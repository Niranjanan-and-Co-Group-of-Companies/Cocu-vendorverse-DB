
'use server';
import { collection, getDocs, writeBatch, doc, updateDoc, addDoc, deleteDoc, query, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { Category } from './categories-service';

export interface CommissionRule {
    id: string;
    categoryId: string;
    categoryName: string;
    type: 'personalized-retail' | 'corporate-bulk';
    commissionRate: number; // percentage
    bufferType: 'fixed' | 'percentage';
    bufferValue: number;
}

export interface Override {
    id: string;
    itemId: string; // Vendor ID or Product ID
    name: string; // Vendor Name or Product Name
    commissionRate: number;
    bufferType: 'fixed' | 'percentage';
    bufferValue: number;
}

export interface CommissionableItem {
    id: string;
    name:string;
}


// --- Seeding Logic ---
async function seedCommissionRules() {
    const commissionsRef = collection(db, "commissions");
    const snapshot = await getDocs(commissionsRef);
    
    // This seeding is now dependent on categories being seeded correctly first.
    // If commissions exist, we assume they are correct and do nothing.
    if (!snapshot.empty) {
        return;
    }

    console.log("Commissions not found, attempting to seed...");

    const categoriesRef = collection(db, "categories");
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    if (categoriesSnapshot.empty) {
        console.log("Categories not found, seeding commissions will be skipped. It will retry on next load.");
        return;
    }
    
    const categories: Category[] = categoriesSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Category));

    const batch = writeBatch(db);

    categories.forEach(category => {
        const isSunshine = category.name === 'Made by Sunshine';
        // Personalized Retail Rule
        const retailRef = doc(commissionsRef);
        batch.set(retailRef, {
            categoryId: category.id,
            categoryName: category.name,
            type: 'personalized-retail',
            commissionRate: isSunshine ? 0 : 15,
            bufferType: 'fixed',
            bufferValue: isSunshine ? 0 : 1.50
        });

        // Corporate & Bulk Rule
        const corporateRef = doc(commissionsRef);
        batch.set(corporateRef, {
            categoryId: category.id,
            categoryName: category.name,
            type: 'corporate-bulk',
            commissionRate: isSunshine ? 0 : 12,
            bufferType: 'percentage',
            bufferValue: isSunshine ? 0 : 5
        });
    });

    await batch.commit();
    console.log("Commissions seeded successfully based on existing categories.");
}

// Seed data on server startup
seedCommissionRules();


// --- Data Fetching ---

export async function getCommissionableItems(type: 'vendor' | 'product'): Promise<CommissionableItem[]> {
    const collectionName = type === 'vendor' ? 'vendors' : 'products';
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
    }));
}


// --- Data Mutation ---

export async function updateCommissionRule(type: 'category' | 'vendor' | 'product', id: string, data: Partial<Omit<CommissionRule, 'id'>>) {
    let docRef;
    if (type === 'category') {
        docRef = doc(db, 'commissions', id);
    } else {
        docRef = doc(db, `${type}CommissionOverrides`, id);
    }
    await updateDoc(docRef, data);
}

export async function addOverride(type: 'vendor' | 'product', itemId: string, name: string) {
    const collectionRef = collection(db, `${type}CommissionOverrides`);
    await addDoc(collectionRef, {
        itemId,
        name,
        commissionRate: 10,
        bufferType: 'fixed',
        bufferValue: 0
    });
}

export async function deleteOverride(type: 'vendor' | 'product', overrideId: string) {
    const docRef = doc(db, `${type}CommissionOverrides`, overrideId);
    await deleteDoc(docRef);
}
