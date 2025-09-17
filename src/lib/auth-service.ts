
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

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // In a real app: return await bcrypt.compare(password, hash);
    return `hashed_${password}` === hash;
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
    const normalizedPhone = `+91${userData.phone.replace(/\D/g, '').slice(-10)}`;


    const newUserRef = await addDoc(collection(db, 'users'), {
        name: userData.name,
        email: userData.email,
        phone: normalizedPhone,
        passwordHash: hashedPassword,
        role: userData.role,
        corporateAccountId: userData.corporateAccountId || null,
        status: 'Active', // Set status to Active directly
        avatar: `https://avatar.vercel.sh/${userData.email}`,
        joinedDate: serverTimestamp(),
        communicationPrefs: { email: true, sms: false },
        phoneVerifiedAt: serverTimestamp(), // Mark phone as verified
    });

    // We can still send a welcome email, but it's no longer for verification.
    // This part can be uncommented once a generic welcome template is ready.
    // await sendWelcomeEmail(userData.email, userData.name);

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

    let redirectPath = '/account';
    if (user.role === 'corporate-admin' || user.role === 'corporate-user') {
        redirectPath = '/corporate/dashboard';
    }

    // In a real app, you would set a session cookie or JWT here.
    
    return { success: true, message: "Login successful!", redirectPath };
}


/**
 * Verifies a user's email address using the provided token.
 * This function is now DEPRECATED for initial signup but can be repurposed for verifying email changes.
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
        return { success: false, message: 'Verification link has expired. Please request a new one.' };
    }

    await updateDoc(doc(db, 'users', userDoc.id), {
        status: 'Active', // Or just update the emailVerifiedAt field if status is already active
        emailVerifiedAt: serverTimestamp(),
        verificationToken: null, 
        verificationTokenExpires: null,
    });

    return { success: true, message: 'Your email has been verified!' };
}
