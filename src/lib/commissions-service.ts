
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
    const resetFlag = 'commissionsResetCompleted_v2';
    if (typeof window !== 'undefined' && sessionStorage.getItem(resetFlag)) {
        return;
    }

    console.log("Performing one-time commissions database reset...");
    
    const commissionsRef = collection(db, "commissions");
    const categoriesRef = collection(db, "categories");
    
    const [commissionsSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(commissionsRef),
        getDocs(categoriesRef)
    ]);
    
    if (categoriesSnapshot.empty) {
        console.log("Categories not found, seeding commissions will be skipped. It will retry on next load.");
        return;
    }

    const batch = writeBatch(db);

    // 1. Delete all existing documents in the 'commissions' collection
    commissionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    // 2. Add the correct, clean list of commissions based on categories
    const categories: Category[] = categoriesSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Category));
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
        if(category.platform === 'Corporate') {
            const corporateRef = doc(commissionsRef);
            batch.set(corporateRef, {
                categoryId: category.id,
                categoryName: category.name,
                type: 'corporate-bulk',
                commissionRate: isSunshine ? 0 : 12,
                bufferType: 'percentage',
                bufferValue: isSunshine ? 0 : 5
            });
        }
    });

    await batch.commit();
    console.log("Commissions database reset and seeding complete.");

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(resetFlag, 'true');
    }
}

// Seed data on server startup - this will now perform the hard reset once per session if needed
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

export async function updateCommissionRule(type: 'category' | 'vendor' | 'product', id: string, data: Partial<Omit<CommissionRule, 'id' | 'categoryName' | 'categoryId' | 'type'>>) {
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
