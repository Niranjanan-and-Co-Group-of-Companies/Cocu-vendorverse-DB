
'use server';

import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, limit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { sendVerificationEmail } from './email-service';
import type { User, UserRole } from './user-service';
import { v4 as uuidv4 } from 'uuid';

// In a real app, you would use a secure library like 'bcrypt' for password hashing.
// For simplicity in this environment, we'll simulate it.
async function hashPassword(password: string): Promise<string> {
    // In a real app: return await bcrypt.hash(password, 10);
    return `hashed_${password}`;
}

/**
 * Checks if a user already exists with the given email or phone number.
 */
export async function checkUserExists(email: string, phone: string): Promise<{ exists: boolean, message?: string }> {
    const usersRef = collection(db, 'users');
    // Normalize phone number for querying
    const normalizedPhone = `+91${phone.replace(/\D/g, '').slice(-10)}`;

    const emailQuery = query(usersRef, where('email', '==', email));
    const phoneQuery = query(usersRef, where('phone', '==', normalizedPhone));

    const [emailSnapshot, phoneSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(phoneQuery)
    ]);

    if (!emailSnapshot.empty) {
        return { exists: true, message: "An account with this email address already exists." };
    }
    if (!phoneSnapshot.empty) {
        return { exists: true, message: "An account with this phone number already exists." };
    }

    return { exists: false };
}


/**
 * Creates a new user with a 'pending' status and sends a verification email.
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
    const verificationToken = uuidv4();
    const normalizedPhone = `+91${userData.phone.replace(/\D/g, '').slice(-10)}`;


    const newUserRef = await addDoc(collection(db, 'users'), {
        name: userData.name,
        email: userData.email,
        phone: normalizedPhone,
        passwordHash: hashedPassword,
        role: userData.role,
        corporateAccountId: userData.corporateAccountId || null,
        status: 'pending-verification',
        avatar: `https://avatar.vercel.sh/${userData.email}`,
        joinedDate: serverTimestamp(),
        communicationPrefs: { email: true, sms: false },
        verificationToken: verificationToken,
        verificationTokenExpires: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send the verification email using our new service
    await sendVerificationEmail(userData.email, userData.name, verificationToken);

    return { success: true, userId: newUserRef.id };
}

/**
 * Verifies a user's email address using the provided token.
 */
export async function verifyUserEmail(token: string): Promise<{ success: boolean; message: string }> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('verificationToken', '==', token), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { success: false, message: 'Invalid or expired verification link.' };
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.verificationTokenExpires && userData.verificationTokenExpires.toMillis() < Date.now()) {
        // Optional: Add logic to delete the user or allow resending verification
        return { success: false, message: 'Verification link has expired. Please sign up again.' };
    }

    await updateDoc(doc(db, 'users', userDoc.id), {
        status: 'Active',
        emailVerifiedAt: serverTimestamp(),
        verificationToken: null, // Invalidate the token
        verificationTokenExpires: null,
    });

    return { success: true, message: 'Your email has been verified! You can now log in.' };
}
