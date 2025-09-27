
'use server';

import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, limit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { sendWelcomeEmail } from './email-service';
import type { User, UserRole } from './user-service';
import { v4 as uuidv4 } from 'uuid';

// In a real app, you would use a secure library like 'bcrypt' for password hashing.
// For simplicity in this environment, we'll simulate it.
async function hashPassword(password: string): Promise<string> {
    // In a real app: return await bcrypt.hash(password, 10);
    return `hashed_${password}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // In a real app: return await bcrypt.compare(password, hash);
    return `hashed_${password}` === hash;
}

/**
 * Checks if a user already exists with the given email or phone number.
 */
export async function checkUserExists(email: string, phone: string): Promise<{ exists: boolean, message?: string }> {
    const usersRef = collection(db, 'users');
    const queries = [];
    
    if (email) {
      queries.push(getDocs(query(usersRef, where('email', '==', email))));
    }
    if (phone) {
      const normalizedPhone = `+91${phone.replace(/\D/g, '').slice(-10)}`;
      queries.push(getDocs(query(usersRef, where('phone', '==', normalizedPhone))));
    }
    
    const snapshots = await Promise.all(queries);

    if (email && !snapshots[0].empty) {
        return { exists: true, message: "An account with this email address already exists." };
    }
    if (phone && snapshots.length > 1 && !snapshots[1].empty) {
        return { exists: true, message: "An account with this phone number already exists." };
    }

    return { exists: false };
}


/**
 * Creates a new user with an 'Active' status after successful OTP verification.
 */
export async function signupUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    corporateAccountId?: string;
}) {
    const { exists, message } = await checkUserExists(userData.email, userData.phone);
    if (exists) {
        throw new Error(message);
    }
    
    const hashedPassword = await hashPassword(userData.password);
    
    const newUserRef = await addDoc(collection(db, 'users'), {
        name: userData.name,
        email: userData.email || null,
        phone: userData.phone ? `+91${userData.phone.replace(/\D/g, '').slice(-10)}` : null,
        passwordHash: hashedPassword,
        role: userData.role,
        corporateAccountId: userData.corporateAccountId || null,
        status: 'Active',
        avatar: `https://avatar.vercel.sh/${userData.email || userData.name}`,
        joinedDate: serverTimestamp(),
        communicationPrefs: { email: !!userData.email, sms: !!userData.phone },
        phoneVerifiedAt: userData.phone ? serverTimestamp() : null,
        emailVerifiedAt: userData.email ? serverTimestamp() : null, // Assuming OTP verification counts as verification
    });

    // Send a welcome email if an email was provided
    if (userData.email) {
        await sendWelcomeEmail(userData.email, userData.name);
    }

    return { success: true, userId: newUserRef.id };
}


export async function loginUser(emailOrPhone: string, password: string): Promise<{ success: boolean; message: string; redirectPath?: string; }> {
    const usersRef = collection(db, 'users');
    const isEmail = emailOrPhone.includes('@');

    const q = isEmail 
        ? query(usersRef, where('email', '==', emailOrPhone), limit(1))
        : query(usersRef, where('phone', '==', emailOrPhone), limit(1));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { success: false, message: "Invalid credentials." };
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User & { passwordHash: string };

    if (user.status !== 'Active') {
        return { success: false, message: `Your account is currently ${user.status}. Please contact support.` };
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
        return { success: false, message: "Invalid credentials." };
    }
    
    // In a real app, you would set a session cookie or JWT here.
    // For this simulation, we'll use sessionStorage on the client.
    
    let redirectPath = '/account';
    if (user.role === 'corporate-admin' || user.role === 'corporate-user') {
        redirectPath = '/corporate/dashboard';
    } else if (user.role === 'admin') {
        redirectPath = '/admin';
    }

    return { success: true, message: "Login successful!", redirectPath };
}
