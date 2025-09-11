
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
import type { SupportTicket, TicketStatus } from '../vendor/support-service';
import { createNotification } from '../notifications-actions';
import { getVendorById } from '../vendors-service';

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
    
    // Create a contextual notification link
    const vendor = await getVendorById(ticket.vendorId);
    const vendorPortalType = vendor?.type || 'personalized';
    let basePath = `/vendor/${vendorPortalType}`;
    if (vendorPortalType === 'both') {
      basePath = '/vendor/both';
    }
    const link = `${basePath}/support?ticketId=${ticket.id}`;
    
    // Send notification to vendor
    await createNotification({
        userId: ticket.vendorId,
        type: 'NEW_MESSAGE',
        text: `You have a new reply on support ticket #${ticket.ticketId}.`,
        link: link
    });
}


/**
 * Updates the status of a support ticket.
 * @param ticketId The ID of the ticket to update.
 * @param status The new status for the ticket.
 */
export async function updateSupportTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    await updateDoc(ticketRef, {
        status: status,
        lastUpdated: serverTimestamp()
    });
    
    // Optional: Notify vendor about status change if it's not part of a reply
    // const ticketSnap = await getDoc(ticketRef);
    // if (ticketSnap.exists()) {
    //     const ticketData = ticketSnap.data() as SupportTicket;
    //     // Create notification logic here...
    // }
}
