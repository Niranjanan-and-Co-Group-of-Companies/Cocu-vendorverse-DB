
'use server';

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { VendorQuote } from './quotes-service';

export async function submitVendorQuote(requestId: string, quoteData: Omit<VendorQuote, 'respondedAt' | 'vendorNotes'>) {
    const requestRef = doc(db, 'quoteRequests', requestId);
    
    const vendorQuote = {
        ...quoteData,
        vendorNotes: '', // Field is removed from UI, so submit an empty string
        respondedAt: serverTimestamp()
    };
    
    await updateDoc(requestRef, {
        vendorQuote: vendorQuote,
        status: 'Responded'
    });
}
