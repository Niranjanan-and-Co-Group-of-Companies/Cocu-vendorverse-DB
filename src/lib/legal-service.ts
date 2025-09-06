
'use server';

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type TermsType = 'customer' | 'vendor';

interface LegalDoc {
    content: string;
    lastUpdated: any; // Firestore Timestamp
}

/**
 * Fetches both customer and vendor terms from Firestore.
 * Initializes them if they don't exist.
 */
export async function getTerms(): Promise<{ customer: string, vendor: string }> {
    const customerRef = doc(db, 'legal', 'customerTerms');
    const vendorRef = doc(db, 'legal', 'vendorTerms');

    let customerSnap = await getDoc(customerRef);
    let vendorSnap = await getDoc(vendorRef);

    // Initialize documents if they don't exist
    if (!customerSnap.exists()) {
        await setDoc(customerRef, { content: '', lastUpdated: serverTimestamp() });
        customerSnap = await getDoc(customerRef);
    }
    if (!vendorSnap.exists()) {
        await setDoc(vendorRef, { content: '', lastUpdated: serverTimestamp() });
        vendorSnap = await getDoc(vendorRef);
    }

    return {
        customer: (customerSnap.data() as LegalDoc)?.content || '',
        vendor: (vendorSnap.data() as LegalDoc)?.content || ''
    };
}

/**
 * Saves both customer and vendor terms to Firestore.
 */
export async function saveTerms(terms: { customer: string, vendor: string }) {
    const customerRef = doc(db, 'legal', 'customerTerms');
    const vendorRef = doc(db, 'legal', 'vendorTerms');
    const timestamp = serverTimestamp();

    await setDoc(customerRef, { content: terms.customer, lastUpdated: timestamp });
    await setDoc(vendorRef, { content: terms.vendor, lastUpdated: timestamp });
}

/**
 * Fetches the last updated timestamp for a specific terms type.
 * This is designed to be called on the client to check against local storage.
 */
export async function getTermsLastUpdated(type: TermsType): Promise<{ content: string; lastUpdated: number | null }> {
    const docId = type === 'customer' ? 'customerTerms' : 'vendorTerms';
    const docRef = doc(db, 'legal', docId);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as LegalDoc;
        return {
            content: data.content,
            lastUpdated: data.lastUpdated?.toMillis() || null,
        };
    }
    
    // If it doesn't exist, create it and return null timestamp
    await setDoc(docRef, { content: '', lastUpdated: serverTimestamp() });
    return { content: '', lastUpdated: null };
}
