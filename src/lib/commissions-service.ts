
import { collection, onSnapshot, getDocs, writeBatch, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
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
let hasSeeded = false;

async function seedCommissionRules() {
    if (hasSeeded) return;

    const commissionsRef = collection(db, "commissions");
    const snapshot = await getDocs(commissionsRef);
    if (!snapshot.empty) {
        hasSeeded = true;
        return;
    }

    console.log("Seeding commission rules...");
    const categoriesRef = collection(db, "categories");
    const categoriesSnapshot = await getDocs(categoriesRef);
    const categories: Category[] = categoriesSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Category));

    const batch = writeBatch(db);

    categories.forEach(category => {
        // Retail Rule
        const retailRef = doc(commissionsRef);
        batch.set(retailRef, {
            categoryId: category.id,
            categoryName: category.name,
            type: 'personalized-retail',
            commissionRate: 15,
            bufferType: 'fixed',
            bufferValue: 1.50
        });

        // Corporate Rule
        const corporateRef = doc(commissionsRef);
        batch.set(corporateRef, {
            categoryId: category.id,
            categoryName: category.name,
            type: 'corporate-bulk',
            commissionRate: 12,
            bufferType: 'percentage',
            bufferValue: 5
        });
    });

    await batch.commit();
    console.log("Commission rules seeded.");
    hasSeeded = true;
}


// --- Real-time Listeners ---

export function onCommissionRulesUpdate(callback: (rules: CommissionRule[]) => void): () => void {
    const commissionsRef = collection(db, 'commissions');
    
    seedCommissionRules().then(() => {
        const unsubscribe = onSnapshot(commissionsRef, (snapshot) => {
            const rules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommissionRule));
            callback(rules);
        });
        return unsubscribe;
    }).catch(console.error);

    return () => console.log("Detached commission rules listener.");
}

export function onOverridesUpdate(type: 'vendor' | 'product', callback: (overrides: Override[]) => void): () => void {
    const overridesRef = collection(db, `${type}CommissionOverrides`);
    
    const unsubscribe = onSnapshot(overridesRef, (snapshot) => {
        const overrides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Override));
        callback(overrides);
    });

    return unsubscribe;
}


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
