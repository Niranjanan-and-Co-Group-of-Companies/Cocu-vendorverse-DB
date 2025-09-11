
'use server';

import { 
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    doc,
    increment
} from 'firebase/firestore';
import { db } from '../firebase';
import type { SupportTicket } from '../vendor/support-service';
import { createNotification } from '../notifications-actions';

/**
 * Sends a message from the admin to a support ticket.
 * @param ticket - The support ticket object.
 * @param text - The message content.
 */
export async function sendAdminSupportMessage(ticket: SupportTicket, text: string): Promise<void> {
    const ticketRef = doc(db, 'supportTickets', ticket.id);
    const messagesRef = collection(ticketRef, 'messages');

    // Add new message
    await addDoc(messagesRef, {
        senderId: 'admin',
        senderType: 'admin',
        text,
        timestamp: serverTimestamp(),
    });

    // Update ticket metadata
    await updateDoc(ticketRef, {
        lastUpdated: serverTimestamp(),
        status: 'Waiting on Vendor',
        isReadByVendor: false,
        unreadVendorCount: increment(1)
    });
    
    // Send notification to vendor
    await createNotification({
        userId: ticket.vendorId,
        type: 'NEW_MESSAGE',
        text: `You have a new reply on support ticket #${ticket.id.slice(0, 6)}.`,
        link: `/vendor/support?ticketId=${ticket.id}`
    });
}
