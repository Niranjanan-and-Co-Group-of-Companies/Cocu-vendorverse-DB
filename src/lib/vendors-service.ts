
import { collection, onSnapshot, getDocs, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate: any; // Keep as any to handle Firestore Timestamps
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  }
}

const MOCK_VENDORS: Omit<Vendor, 'id' | 'joinedDate'>[] = [
    { name: 'Gourmet Delights', email: 'contact@gourmetdelights.com', phone: '9876543210', avatar: 'https://i.pravatar.cc/40?u=vendor001', status: 'Active', address: { street: '123 Foodie Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India'} },
    { name: 'Serene Moments', email: 'support@serenemoments.co', phone: '9876543211', avatar: 'https://i.pravatar.cc/40?u=vendor002', status: 'Active', address: { street: '456 Wellness Way', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India'} },
    { name: 'Heritage Wares', email: 'info@heritagewares.com', phone: '9876543212', avatar: 'https://i.pravatar.cc/40?u=vendor003', status: 'Pending', address: { street: '789 Craft Circle', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', country: 'India'} },
    { name: 'The Daily Grind', email: 'hello@dailygrind.coffee', phone: '9876543213', avatar: 'https://i.pravatar.cc/40?u=vendor004', status: 'Active', address: { street: '101 Brew Avenue', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', country: 'India'} },
    { name: 'Modern Blooms', email: 'contact@modernblooms.com', phone: '9876543214', avatar: 'https://i.pravatar.cc/40?u=vendor005', status: 'Suspended', address: { street: '212 Flower Road', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India'} },
    { name: 'Signature Gifts', email: 'sales@signaturegifts.com', phone: '9876543215', avatar: 'https://i.pravatar.cc/40?u=vendor006', status: 'Active', address: { street: '313 Gifting Plaza', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India'} },
    { name: 'Techie Gifts', email: 'support@techiegifts.com', phone: '9876543216', avatar: 'https://i.pravatar.cc/40?u=vendor007', status: 'Active', address: { street: '414 Circuit Board', city: 'Hyderabad', state: 'Telangana', pincode: '500001', country: 'India'} },
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

export async function getVendorById(id: string): Promise<Vendor | null> {
    if (!id) return null;
    const docRef = doc(db, 'vendors', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Vendor : null;
}
