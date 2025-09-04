
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Suspended';
  joinedDate: any; 
}

// In a real application, you would have an authentication hook to get the current user's ID.
// For demonstration purposes, we will fetch a specific, known user from the database.
const MOCK_USER_ID = 'user001'; 

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
