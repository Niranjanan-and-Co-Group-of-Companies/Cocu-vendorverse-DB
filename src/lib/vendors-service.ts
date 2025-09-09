
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate: any; // Keep as any to handle Firestore Timestamps
}

/**
 * Fetches all vendors from the database.
 * @returns A promise that resolves to an array of Vendor objects.
 */
export async function getVendors(): Promise<Vendor[]> {
    const vendorsRef = collection(db, "vendors");
    const snapshot = await getDocs(vendorsRef);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
}
