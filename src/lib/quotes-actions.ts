
'use server';

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { VendorQuote } from './quotes-service';

export async function submitVendorQuote(requestId: string, quoteData: Omit<VendorQuote, 'respondedAt'>) {
    const requestRef = doc(db, 'quoteRequests', requestId);
    
    const vendorQuote: VendorQuote = {
        ...quoteData,
        respondedAt: serverTimestamp()
    };
    
    await updateDoc(requestRef, {
        vendorQuote: vendorQuote,
        status: 'Responded'
    });
}
