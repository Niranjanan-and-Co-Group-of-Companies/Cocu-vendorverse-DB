
import { collection, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate: any; // Keep as any to handle Firestore Timestamps
}

const MOCK_VENDORS: Omit<Vendor, 'id' | 'joinedDate'>[] = [
    { name: 'Gourmet Delights', email: 'contact@gourmetdelights.com', avatar: 'https://i.pravatar.cc/40?u=vendor001', status: 'Active' },
    { name: 'Serene Moments', email: 'support@serenemoments.co', avatar: 'https://i.pravatar.cc/40?u=vendor002', status: 'Active' },
    { name: 'Heritage Wares', email: 'info@heritagewares.com', avatar: 'https://i.pravatar.cc/40?u=vendor003', status: 'Pending' },
    { name: 'The Daily Grind', email: 'hello@dailygrind.coffee', avatar: 'https://i.pravatar.cc/40?u=vendor004', status: 'Active' },
    { name: 'Modern Blooms', email: 'contact@modernblooms.com', avatar: 'https://i.pravatar.cc/40?u=vendor005', status: 'Suspended' },
    { name: 'Signature Gifts', email: 'sales@signaturegifts.com', avatar: 'https://i.pravatar.cc/40?u=vendor006', status: 'Active' },
    { name: 'Techie Gifts', email: 'support@techiegifts.com', avatar: 'https://i.pravatar.cc/40?u=vendor007', status: 'Active' },
];


async function seedVendors() {
    const vendorsRef = collection(db, "vendors");
    const snapshot = await getDocs(vendorsRef);
    if (snapshot.empty) {
        console.log("Seeding vendors...");
        const batch = writeBatch(db);
        MOCK_VENDORS.forEach(vendor => {
            const docRef = doc(vendorsRef);
            batch.set(docRef, vendor);
        });
        await batch.commit();
    }
}


/**
 * Fetches all vendors from the database.
 * @returns A promise that resolves to an array of Vendor objects.
 */
export async function getVendors(): Promise<Vendor[]> {
    await seedVendors();
    const vendorsRef = collection(db, "vendors");
    const snapshot = await getDocs(vendorsRef);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
}
