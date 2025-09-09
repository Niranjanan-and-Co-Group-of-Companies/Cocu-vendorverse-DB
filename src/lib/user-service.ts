

import { doc, getDoc, collection, onSnapshot, Unsubscribe, setDoc, serverTimestamp } from 'firebase/firestore';
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

// In a real application, you would have an authentication hook to get the current user's ID.
// For demonstration purposes, we will fetch a specific, known user from the database.
const MOCK_USER_ID = 'user001'; 
const MOCK_USERS: Omit<User, 'id' | 'joinedDate'>[] = [
    { name: 'Alice Johnson', email: 'alice.j@example.com', avatar: 'https://i.pravatar.cc/40?u=user001', role: 'customer', status: 'Active', communicationPrefs: { email: true, sms: false } },
    { name: 'Admin User', email: 'admin@vendorverse.com', avatar: 'https://i.pravatar.cc/40?u=admin', role: 'admin', status: 'Active', communicationPrefs: { email: true, sms: true } },
    { name: 'Gourmet Delights', email: 'contact@gourmetdelights.com', avatar: 'https://i.pravatar.cc/40?u=vendor001', role: 'vendor', status: 'Active', communicationPrefs: { email: true, sms: true } },
]

async function seedUsers() {
    const user001Ref = doc(db, 'users', 'user001');
    const user001Snap = await getDoc(user001Ref);
    if (!user001Snap.exists()) {
        console.log("Seeding mock users...");
        for (const user of MOCK_USERS) {
            const id = user.role === 'admin' ? 'admin001' : user.role === 'vendor' ? 'vendor001' : 'user001';
             await setDoc(doc(db, "users", id), {
                ...user,
                joinedDate: serverTimestamp()
            });
        }
    }
}
seedUsers();


/**
 * Fetches a mock user from the database to simulate a logged-in user.
 * @returns A promise that resolves to the User object or null if not found.
 */
export async function getMockUser(): Promise<User | null> {
    const userRef = doc(db, 'users', MOCK_USER_ID);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as User;
        } else {
            console.warn(`Mock user with ID "${MOCK_USER_ID}" not found.`);
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
