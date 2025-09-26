
'use server';

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { RmaStatus } from '../returns-service';

/**
 * Updates the status of an RMA request.
 * @param rmaId The ID of the RMA log document.
 * @param status The new status to set.
 */
export async function updateRmaStatus(rmaId: string, status: RmaStatus): Promise<void> {
    const rmaRef = doc(db, 'returns_rma', rmaId);
    
    try {
        await updateDoc(rmaRef, {
            status: status,
            updatedAt: serverTimestamp(),
        });
        // Here you would typically also create a notification for the customer.
    } catch (error) {
        console.error("Error updating RMA status:", error);
        throw new Error("Failed to update RMA status.");
    }
}
