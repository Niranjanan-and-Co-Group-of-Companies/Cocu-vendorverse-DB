
'use server';

import 'dotenv/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { sendOtpEmail } from './email-service';
import { getDoc } from 'firebase/firestore';


const API_KEY = process.env.TWO_FACTOR_API_KEY;
const API_URL = 'https://2factor.in/API/V1';

type OtpStatus = 'pending' | 'verified' | 'expired' | 'failed';

/**
 * Determines if the input is an email.
 * @param input The user input string.
 * @returns True if the input is a valid email format.
 */
function isEmail(input: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
}


/**
 * Generates and sends a new OTP via SMS (2Factor.in) or Email (ZeptoMail).
 * @param to - The recipient's 10-digit phone number or email address.
 * @param name - The recipient's name (required for email).
 */
export async function sendOtp(to: string, name: string = 'User'): Promise<{ success: boolean; message: string }> {
    if (isEmail(to)) {
        return sendEmailOtpFlow(to, name);
    } else {
        return sendSmsOtpFlow(to);
    }
}


/**
 * Sends an OTP via Email.
 */
async function sendEmailOtpFlow(email: string, name: string): Promise<{ success: boolean; message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
        await addDoc(collection(db, 'otp_sessions'), {
            to: email.toLowerCase(),
            otp: otp, // Store the OTP directly for email verification
            createdAt: serverTimestamp(),
            status: 'pending' as OtpStatus,
        });

        // This function will use ZeptoMail to send the templated email
        const emailResult = await sendOtpEmail(email, name, otp);

        if (emailResult.success) {
            return { success: true, message: `An OTP has been sent to ${email}.` };
        } else {
            return { success: false, message: emailResult.message || 'Failed to send OTP email.' };
        }

    } catch (error) {
        console.error("Error creating email OTP session:", error);
        return { success: false, message: "Failed to create an email OTP session." };
    }
}


/**
 * Sends an OTP via SMS.
 */
async function sendSmsOtpFlow(phone: string): Promise<{ success: boolean; message: string }> {
    if (!/^\d{10}$/.test(phone)) {
        return { success: false, message: "Invalid phone number format. Please provide a 10-digit number." };
    }

    // If API key is missing, use demo mode (OTP is 123456)
    if (!API_KEY) {
        console.warn("2Factor API key is not configured. Using demo mode. Use OTP 123456 to verify phone.");
        return { success: true, message: "OTP Sent (Demo Mode). Use 123456 to verify." };
    }
    
    const phoneNumberForApi = `91${phone}`;

    try {
        const response = await fetch(`${API_URL}/${API_KEY}/SMS/${phoneNumberForApi}/AUTOGEN/VendorVerseOTP`);
        
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`2Factor API Error: ${response.status} - ${errorBody}`);
        }

        const json = await response.json();

        if (json.Status !== 'Success') {
            throw new Error(json.Details);
        }
        
        // Store session details from 2Factor
        await addDoc(collection(db, 'otp_sessions'), {
            to: `+91${phone}`,
            sessionId: json.Details,
            createdAt: serverTimestamp(),
            status: 'pending' as OtpStatus,
        });

        return { success: true, message: `An OTP has been sent to +91${phone}.` };
    } catch (error: any) {
        console.error("Error sending SMS OTP:", error);
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}

/**
 * Verifies an OTP from either SMS or Email.
 */
export async function verifyOtp(to: string, otpAttempt: string): Promise<{ success: boolean; message: string }> {
    if (isEmail(to)) {
        return verifyEmailOtpFlow(to, otpAttempt);
    } else {
        return verifySmsOtpFlow(to, otpAttempt);
    }
}

/**
 * Verifies an email OTP from Firestore.
 */
async function verifyEmailOtpFlow(email: string, otpAttempt: string): Promise<{ success: boolean; message: string }> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const sessionsRef = collection(db, 'otp_sessions');
    const q = query(
        sessionsRef, 
        where('to', '==', email.toLowerCase()), 
        where('status', '==', 'pending'),
        where('createdAt', '>=', tenMinutesAgo),
        orderBy('createdAt', 'desc'), 
        limit(1)
    );
    
    try {
        const sessionSnapshot = await getDocs(q);

        if (sessionSnapshot.empty) {
            return { success: false, message: "No pending OTP found or OTP has expired. Please try again." };
        }
        
        const sessionDoc = sessionSnapshot.docs[0];
        const sessionData = sessionDoc.data();

        if (sessionData.otp === otpAttempt) {
            await updateDoc(doc(db, 'otp_sessions', sessionDoc.id), { status: 'verified' });
            return { success: true, message: "Email verified successfully." };
        } else {
            return { success: false, message: "Invalid OTP." };
        }

    } catch (error) {
        console.error("Error verifying email OTP:", error);
        return { success: false, message: "An unexpected error occurred during email verification." };
    }
}


/**
 * Verifies an SMS OTP using the 2Factor service.
 */
async function verifySmsOtpFlow(phone: string, otpAttempt: string): Promise<{ success: boolean; message: string }> {
     // Handle demo mode for phone verification
     if (!API_KEY) {
        if (otpAttempt === '123456') {
            return { success: true, message: "Phone verified successfully (demo mode)." };
        }
        return { success: false, message: "Invalid OTP (demo mode)." };
    }
    
    try {
        const sessionsRef = collection(db, 'otp_sessions');
        const q = query(sessionsRef, where('to', '==', `+91${phone}`), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(1));
        const sessionSnapshot = await getDocs(q);

        if (sessionSnapshot.empty) {
            return { success: false, message: "No pending OTP session found. Please request a new one." };
        }
        
        const sessionDoc = sessionSnapshot.docs[0];
        const sessionId = sessionDoc.data().sessionId;

        if (!sessionId) {
            return { success: false, message: "Invalid session ID found. Please try again." };
        }

        const response = await fetch(`${API_URL}/${API_KEY}/SMS/VERIFY/${sessionId}/${otpAttempt}`);
        
        if (!response.ok) {
            throw new Error(`2Factor verification API request failed with status: ${response.status}`);
        }
        
        const json = await response.json();

        if (json.Status === 'Success') {
            await updateDoc(doc(db, 'otp_sessions', sessionDoc.id), { status: 'verified' });
            return { success: true, message: "Phone verified successfully." };
        } else {
            return { success: false, message: json.Details || "Invalid or expired OTP." };
        }
    } catch (error: any) {
        console.error("Error verifying SMS OTP:", error);
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}

