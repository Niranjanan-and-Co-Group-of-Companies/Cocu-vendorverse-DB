'use server';

import 'dotenv/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

const API_KEY = process.env.TWO_FACTOR_API_KEY;
const API_URL = 'https://2factor.in/API/V1';

type OtpStatus = 'pending' | 'verified' | 'expired' | 'failed';


/**
 * Generates and sends a new OTP using 2Factor.in API.
 * @param to - The recipient's 10-digit phone number.
 */
export async function sendOtp(to: string): Promise<{ success: boolean; message: string }> {
    if (!API_KEY) {
        console.error("2Factor API key is not configured. Please set TWO_FACTOR_API_KEY in your .env file.");
        return { success: false, message: "Server configuration error." };
    }

    if (!/^\d{10}$/.test(to)) {
        return { success: false, message: "Invalid phone number format." };
    }

    try {
        const response = await fetch(`${API_URL}/${API_KEY}/SMS/${to}/AUTOGEN/VendorVerse`);
        
        if (!response.ok) {
            console.error("2Factor API request failed with status:", response.status);
            return { success: false, message: "Failed to send OTP. Please try again later." };
        }

        const json = await response.json();

        if (json.Status !== 'Success') {
            console.error("2Factor API Error:", json.Details);
            return { success: false, message: "Failed to send OTP. Please check the number and try again." };
        }
        
        const sessionId = json.Details;
        
        // Store the session ID for verification
        await addDoc(collection(db, 'otp_sessions'), {
            to: `+91${to}`,
            sessionId: sessionId,
            createdAt: serverTimestamp(),
            status: 'pending' as OtpStatus,
        });

        return { success: true, message: `OTP sent. Session ID: ${sessionId}` };
    } catch (error) {
        console.error("Error sending OTP via 2Factor API:", error);
        return { success: false, message: "An unexpected error occurred while sending the OTP." };
    }
}


/**
 * Verifies an OTP using the 2Factor service.
 * @param to - The 10-digit phone number.
 * @param otpAttempt - The OTP entered by the user.
 */
export async function verifyOtp(to: string, otpAttempt: string): Promise<{ success: boolean; message: string }> {
     if (!API_KEY) {
        console.error("2Factor API key not found for verification.");
        // In demo mode, accept a hardcoded OTP.
        if (otpAttempt === '123456') {
            return { success: true, message: "OTP verified successfully (demo mode)." };
        }
        return { success: false, message: "Invalid OTP (demo mode)." };
    }
    
    try {
        // Find the latest OTP session for this number
        const sessionsRef = collection(db, 'otp_sessions');
        const q = query(sessionsRef, where('to', '==', `+91${to}`), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(1));
        const sessionSnapshot = await getDocs(q);

        if (sessionSnapshot.empty) {
            return { success: false, message: "No pending OTP session found. Please request a new one." };
        }
        
        const sessionDoc = sessionSnapshot.docs[0];
        const sessionId = sessionDoc.data().sessionId;

        const response = await fetch(`${API_URL}/${API_KEY}/SMS/VERIFY/${sessionId}/${otpAttempt}`);
        
        if (!response.ok) {
            console.error("2Factor verification API request failed with status:", response.status);
            return { success: false, message: "Could not verify OTP. Service may be unavailable." };
        }
        
        const json = await response.json();

        if (json.Status === 'Success') {
            await updateDoc(doc(db, 'otp_sessions', sessionDoc.id), { status: 'verified' });
            return { success: true, message: "OTP verified successfully." };
        } else {
            return { success: false, message: json.Details || "Invalid or expired OTP." };
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, message: "An unexpected error occurred during verification." };
    }
}
