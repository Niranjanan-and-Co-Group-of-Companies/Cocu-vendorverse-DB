

import { doc, getDoc, collection, onSnapshot, Unsubscribe, setDoc, serverTimestamp, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from './firebase';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: 'Active' | 'Suspended';
  joinedDate: any; 
  communicationPrefs: { email: boolean; sms: boolean; };
}

const MOCK_USERS: Omit<User, 'id' | 'joinedDate'>[] = [
    { name: 'Alice Johnson', email: 'alice.j@example.com', avatar: 'https://i.pravatar.cc/40?u=user001', role: 'customer', status: 'Active', communicationPrefs: { email: true, sms: false } },
    { name: 'Admin User', email: 'admin@vendorverse.com', avatar: 'https://i.pravatar.cc/40?u=admin', role: 'admin', status: 'Active', communicationPrefs: { email: true, sms: true } },
    { name: 'Bob Williams', email: 'bob.w@example.com', avatar: 'https://i.pravatar.cc/40?u=user002', role: 'customer', status: 'Active', communicationPrefs: { email: true, sms: true } },
    { name: 'Charlie Brown', email: 'charlie.b@example.com', avatar: 'https://i.pravatar.cc/40?u=user003', role: 'customer', status: 'Suspended', communicationPrefs: { email: false, sms: false } },
    { name: 'Diana Prince', email: 'diana.p@example.com', avatar: 'https://i.pravatar.cc/40?u=user004', role: 'customer', status: 'Active', communicationPrefs: { email: true, sms: true } },
];

async function seedUsers() {
    const seedFlagRef = doc(db, 'internal_flags', 'usersSeeded_v2');
    const seedFlagSnap = await getDoc(seedFlagRef);

    if (seedFlagSnap.exists()) {
        return;
    }

    console.log("Seeding mock users v2...");
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const existingEmails = new Set(snapshot.docs.map(d => d.data().email));

    const batch = writeBatch(db);
    MOCK_USERS.forEach(user => {
        if (!existingEmails.has(user.email)) {
            const userRef = doc(usersRef);
            batch.set(userRef, {
                ...user,
                joinedDate: serverTimestamp()
            });
        }
    });
    await batch.commit();

    await setDoc(seedFlagRef, { completed: true });
    console.log("Mock users seeding complete.");
}
seedUsers();

const MOCK_USER_ID = 'user001'; 
export async function getMockUser(): Promise<User | null> {
    // This function now needs to find the user by a property, not a specific ID
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", "alice.j@example.com"), limit(1));
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            return { id: docSnap.id, ...docSnap.data() } as User;
        } else {
            console.warn(`Mock user "alice.j@example.com" not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching mock user:", error);
        return null;
    }
}

export function onUsersUpdate(callback: (users: User[]) => void): Unsubscribe {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as User));
        callback(users);
    });
    return unsubscribe;
}
