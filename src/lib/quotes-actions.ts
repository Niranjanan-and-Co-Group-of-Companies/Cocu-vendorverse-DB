
'use server';

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { VendorQuote } from './quotes-service';
import type { Product } from './products';
import { getCategoryByName } from './categories-service';
import { calculateDisplayPriceFromQuote } from './pricing-service';


export async function submitVendorQuote(requestId: string, quoteData: Omit<VendorQuote, 'respondedAt'> & { product: Pick<Product, 'id' | 'category'>}) {
    const requestRef = doc(db, 'quoteRequests', requestId);

    const category = await getCategoryByName(quoteData.product.category);
    const displayPrice = await calculateDisplayPriceFromQuote(quoteData.finalPrice, quoteData.product, category ?? undefined, 'corporate');
    
    const vendorQuote = {
        finalPrice: quoteData.finalPrice,
        estimatedCompletionDate: quoteData.estimatedCompletionDate,
        vendorNotes: quoteData.vendorNotes,
        respondedAt: serverTimestamp(),
        // Store the calculated price for the customer view
        customerDisplayPrice: displayPrice
    };
    
    await updateDoc(requestRef, {
        vendorQuote: vendorQuote,
        status: 'Responded'
    });
}
