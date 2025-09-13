
'use server';

import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { compare, hash } from 'bcryptjs';

const API_KEY = process.env.TWO_FACTOR_API_KEY;
const API_URL = 'https://2factor.in/API/V1';

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
 * Generates and sends a new OTP.
 * @param to - The recipient's 10-digit phone number.
 */
export async function sendOtp(to: string): Promise<{ success: boolean; message: string }> {
    if (!API_KEY) {
        console.error("2Factor API key is not configured.");
        return { success: false, message: "SMS service is not configured." };
    }
    if (!/^\d{10}$/.test(to)) {
        return { success: false, message: "Invalid phone number format." };
    }

    try {
        const response = await fetch(`${API_URL}/${API_KEY}/SMS/+91${to}/AUTOGEN/VendorVerse`);
        const json = await response.json();

        if (json.Status !== 'Success') {
            console.error("2Factor API Error:", json.Details);
            return { success: false, message: "Failed to send OTP. Please try again." };
        }
        
        const sessionId = json.Details;
        
        await addDoc(collection(db, 'otp_sessions'), {
            to: `+91${to}`,
            sessionId: sessionId,
            createdAt: serverTimestamp(),
            status: 'pending',
        });

        return { success: true, message: `OTP sent successfully.` };
    } catch (error) {
        console.error("Error sending OTP:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}


/**
 * Verifies an OTP using the 2Factor service.
 * @param to - The 10-digit phone number.
 * @param otpAttempt - The OTP entered by the user.
 */
export async function verifyOtp(to: string, otpAttempt: string): Promise<{ success: boolean; message: string }> {
    if (!API_KEY) {
        console.error("2Factor API key is not configured.");
        return { success: false, message: "SMS service is not configured." };
    }

    try {
        const response = await fetch(`${API_URL}/${API_KEY}/SMS/VERIFY3/+91${to}/${otpAttempt}`);
        const json = await response.json();

        if (json.Status === 'Success') {
            return { success: true, message: "OTP verified successfully." };
        } else {
            return { success: false, message: json.Details || "Invalid OTP." };
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, message: "An unexpected error occurred during verification." };
    }
}
