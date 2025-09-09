
'use server';

import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { hash } from 'bcryptjs'; // A more secure way to handle OTPs

type OtpType = 'email' | 'phone';
type OtpStatus = 'pending' | 'verified' | 'expired' | 'failed';

interface OtpLog {
    id?: string;
    type: OtpType;
    to: string; // The email address or phone number
    otpHash: string;
    expiresAt: any; // Firestore Timestamp
    attempts: number;
    status: OtpStatus;
}

const MAX_ATTEMPTS = 5;

/**
 * Creates and stores a new OTP log.
 * In a real app, this would also trigger the email/SMS sending.
 * @param type - The type of OTP (email or phone).
 * @param to - The recipient's email or phone number.
 * @param otp - The plain text OTP.
 * @param validityInMinutes - How long the OTP is valid for.
 */
export async function createOtp(type: OtpType, to: string, otp: string, validityInMinutes: number = 5): Promise<void> {
    const saltRounds = 10;
    const otpHash = await hash(otp, saltRounds);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + validityInMinutes);

    await addDoc(collection(db, 'otp_logs'), {
        type,
        to,
        otpHash,
        expiresAt: serverTimestamp(),
        attempts: 0,
        status: 'pending',
    });
    // Here you would call your email (ZeptoMail) or SMS (2Factor) service
    console.log(`(Simulation) OTP ${otp} sent to ${to}`);
}

/**
 * Verifies an OTP against the stored hash.
 * @param to - The email or phone number the OTP was sent to.
 * @param otpAttempt - The plain text OTP entered by the user.
 * @returns True if verification is successful, false otherwise.
 */
export async function verifyOtp(to: string, otpAttempt: string): Promise<boolean> {
    const otpRef = collection(db, 'otp_logs');
    const q = query(
        otpRef,
        where('to', '==', to),
        where('status', '==', 'pending'),
        where('expiresAt', '>', new Date())
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return false; // No pending OTP found
    }

    const otpDoc = snapshot.docs[0]; // Get the most recent one
    const otpData = otpDoc.data() as OtpLog;

    if (otpData.attempts >= MAX_ATTEMPTS) {
        await updateDoc(otpDoc.ref, { status: 'failed' });
        return false; // Too many attempts
    }

    const isMatch = await hash(otpAttempt, otpData.otpHash); // This should use bcrypt.compare

    if (isMatch) {
        await updateDoc(otpDoc.ref, { status: 'verified' });
        return true;
    } else {
        await updateDoc(otpDoc.ref, { attempts: otpData.attempts + 1 });
        return false;
    }
}
