
'use client';

import { collection, onSnapshot, query, where, Unsubscribe, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User, UserRole } from './user-service';

export function onCorporateUsersUpdate(corporateAccountId: string, callback: (users: User[]) => void): Unsubscribe {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('corporateAccountId', '==', corporateAccountId));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
    callback(users);
  }, (error) => {
    console.error("Error fetching corporate users: ", error);
    callback([]);
  });

  return unsubscribe;
}

export async function addCorporateUser(
  corporateAccountId: string, 
  userData: { name: string, email: string, role: UserRole }
) {
  const usersRef = collection(db, 'users');
  await addDoc(usersRef, {
    ...userData,
    corporateAccountId,
    status: 'Pending', // New users are pending until they accept invitation
    avatar: `https://avatar.vercel.sh/${userData.email}`,
    joinedDate: serverTimestamp(),
    communicationPrefs: { email: true, sms: false },
  });
  // In a real app, you would also trigger an invitation email here.
}

export async function updateCorporateUserRole(userId: string, role: UserRole) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role });
}

export async function removeCorporateUser(userId: string) {
  const userRef = doc(db, 'users', userId);
  // Instead of deleting, we'll mark them as suspended and remove the account link.
  // This preserves their history but revokes access.
  await updateDoc(userRef, { 
      status: 'Suspended', 
      corporateAccountId: null 
  });
}
