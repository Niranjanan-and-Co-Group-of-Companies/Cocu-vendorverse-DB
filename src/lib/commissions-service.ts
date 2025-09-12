

'use server';
import { collection, getDocs, writeBatch, doc, updateDoc, addDoc, deleteDoc, query, Unsubscribe, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getCategories, type Category } from './categories-service';

export interface CommissionRule {
    id: string;
    categoryId: string;
    categoryName: string;
    type: 'personalized-retail' | 'corporate-bulk';
    commissionRate: number; // percentage
}

export interface Override {
    id: string;
    itemId: string; // Vendor ID or Product ID
    name: string; // Vendor Name or Product Name
    commissionRate: number;
}

export interface CommissionableItem {
    id: string;
    name:string;
}


// --- Seeding Logic ---
async function seedCommissionRules() {
    const seedFlagRef = doc(db, 'internal_flags', 'commissionsSeeded_v5');
    const seedFlagSnap = await getDoc(seedFlagRef);

    if (seedFlagSnap.exists()) {
        return; // Seeding already performed.
    }

    console.log("Performing one-time commissions database hard reset v5 (no buffer)...");
    
    const commissionsRef = collection(db, "commissions");
    const [commissionsSnapshot, categories] = await Promise.all([
        getDocs(commissionsRef),
        getCategories() // Fetch clean categories, which will also trigger their own seed/reset if needed
    ]);
    
    if (categories.length === 0) {
        console.log("Categories not found, seeding commissions will be skipped. It will retry on next load.");
        return;
    }

    const batch = writeBatch(db);

    // 1. Delete all existing documents in the 'commissions' collection
    commissionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    // 2. Add the correct, clean list of commissions based on categories
    categories.forEach(category => {
        const isSunshine = category.name === 'Made by Sunshine';
        
        // Create rule for personalized retail
        if (category.platform === 'Personalized') {
            const retailRef = doc(commissionsRef);
            batch.set(retailRef, {
                categoryId: category.id,
                categoryName: category.name,
                type: 'personalized-retail',
                commissionRate: isSunshine ? 0 : 15,
            });
        }
        
        // Create rule for corporate
        if(category.platform === 'Corporate') {
            const corporateRef = doc(commissionsRef);
            batch.set(corporateRef, {
                categoryId: category.id,
                categoryName: category.name,
                type: 'corporate-bulk',
                commissionRate: 12,
            });
        }
    });

    await batch.commit();
    console.log("Commissions database reset and seeding complete (no buffer).");

    // Set the flag to prevent this from running again
    await setDoc(seedFlagRef, { completed: true });
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
    });
}

export async function deleteOverride(type: 'vendor' | 'product', overrideId: string) {
    const docRef = doc(db, `${type}CommissionOverrides`, overrideId);
    await deleteDoc(docRef);
}
