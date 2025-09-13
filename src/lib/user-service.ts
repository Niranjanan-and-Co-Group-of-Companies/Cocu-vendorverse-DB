

import { doc, getDoc, collection, onSnapshot, Unsubscribe, setDoc, serverTimestamp, getDocs, writeBatch, query, where, limit, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserRole = 'customer' | 'vendor' | 'admin' | 'corporate-admin' | 'corporate-user';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: UserRole;
  status: 'Active' | 'Suspended' | 'Pending'; // Added 'Pending' for invited users
  joinedDate: any; 
  communicationPrefs: { email: boolean; sms: boolean; };
  corporateAccountId?: string; // Link to the corporate client
}

const MOCK_USERS: Omit<User, 'id' | 'joinedDate'>[] = [
    { name: 'Alice Johnson', email: 'alice.j@example.com', phone: '+919876543210', avatar: 'https://i.pravatar.cc/40?u=user001', role: 'customer', status: 'Active', communicationPrefs: { email: true, sms: false } },
    { name: 'Admin User', email: 'admin@vendorverse.com', phone: '+919999999999', avatar: 'https://i.pravatar.cc/40?u=admin', role: 'admin', status: 'Active', communicationPrefs: { email: true, sms: true } },
    { name: 'Bob Williams', email: 'bob.w@example.com', phone: '+919876543211', avatar: 'https://i.pravatar.cc/40?u=user002', role: 'customer', status: 'Active', communicationPrefs: { email: true, sms: true } },
    { name: 'Charlie Brown', email: 'charlie.b@example.com', phone: '+919876543212', avatar: 'https://i.pravatar.cc/40?u=user003', role: 'customer', status: 'Suspended', communicationPrefs: { email: false, sms: false } },
    { name: 'Diana Prince', email: 'diana.p@example.com', phone: '+919876543213', avatar: 'https://i.pravatar.cc/40?u=user004', role: 'customer', status: 'Active', communicationPrefs: { email: true, sms: true } },
    // Corporate Users for Globex
    { name: 'John Smith', email: 'john.smith@globex.com', phone: '+91 98765 43210', avatar: 'https://i.pravatar.cc/40?u=corp1', role: 'corporate-admin', status: 'Active', communicationPrefs: { email: true, sms: true }, corporateAccountId: 'zR2K8aaI11ueHqC3K24r' },
    { name: 'Sarah Connor', email: 'sarah.connor@globex.com', phone: '+919876543214', avatar: 'https://i.pravatar.cc/40?u=corp2', role: 'corporate-user', status: 'Active', communicationPrefs: { email: true, sms: false }, corporateAccountId: 'zR2K8aaI11ueHqC3K24r' },
    { name: 'Kyle Reese', email: 'kyle.reese@globex.com', phone: '+919876543215', avatar: 'https://i.pravatar.cc/40?u=corp3', role: 'corporate-user', status: 'Pending', communicationPrefs: { email: true, sms: true }, corporateAccountId: 'zR2K8aaI11ueHqC3K24r' },
];

async function seedUsers() {
    const seedFlagRef = doc(db, 'internal_flags', 'usersSeeded_v4');
    const seedFlagSnap = await getDoc(seedFlagRef);

    if (seedFlagSnap.exists()) {
        return;
    }

    console.log("Seeding mock users v4...");
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    // Clear existing users to ensure clean seed
    if (!snapshot.empty) {
        const deleteBatch = writeBatch(db);
        snapshot.docs.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();
    }

    const batch = writeBatch(db);
    MOCK_USERS.forEach(user => {
        const userRef = doc(usersRef);
        batch.set(userRef, {
            ...user,
            joinedDate: serverTimestamp()
        });
    });
    await batch.commit();

    await setDoc(seedFlagRef, { completed: true });
    console.log("Mock users seeding v4 complete.");
}
seedUsers();

const MOCK_USER_ID = 'user001'; 
export async function getMockUser(): Promise<User | null> {
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

export async function updateUserContact(userId: string, field: 'email' | 'phone' | 'name', value: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { [field]: value });
}
