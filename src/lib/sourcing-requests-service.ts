
'use server';

import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { createNotification } from './notifications-actions';

export type SourcingRequestStatus = 'New' | 'In Progress' | 'Sourced' | 'Closed';

export interface SourcingRequest {
    id: string;
    productDescription: string;
    quantity: number;
    budget: number;
    requiredBy?: any; // Firestore Timestamp
    notes: string;
    contactName: string;
    contactPhone: string;
    customerId: string; // The ID of the corporate user/company
    attachments: { name: string; url: string }[];
    status: SourcingRequestStatus;
    createdAt: any; // Firestore Timestamp
}

/**
 * Creates a new sourcing request in Firestore and handles file uploads.
 * @param data - The request data from the form.
 */
export async function createSourcingRequest(data: Omit<SourcingRequest, 'id' | 'status' | 'createdAt' | 'attachments'> & { files: File[] }) {
    const { files, ...requestData } = data;
    
    // In a real app, this would come from the authenticated user context
    const customerId = 'corp-123';
    
    // 1. Upload files to Firebase Storage
    const attachmentUrls = await Promise.all(
        files.map(async (file) => {
            const storageRef = ref(storage, `sourcing_requests/${customerId}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return { name: file.name, url };
        })
    );

    // 2. Create the document in Firestore
    const finalData = {
        ...requestData,
        quantity: Number(requestData.quantity) || 0,
        customerId,
        attachments: attachmentUrls,
        status: 'New' as SourcingRequestStatus,
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'sourcingRequests'), finalData);

    // 3. Create a notification for the admin
    await createNotification({
        userId: 'admin',
        forAdmin: true,
        type: 'NEW_SOURCING_REQUEST',
        text: `New sourcing request from ${data.contactName} for "${data.productDescription.substring(0, 30)}..."`,
        link: `/admin/sourcing-requests?id=${docRef.id}`,
    });

    return docRef.id;
}


/**
 * Updates the status of a sourcing request and notifies the customer.
 * @param requestId The ID of the request to update.
 * @param status The new status.
 */
export async function updateSourcingRequestStatus(requestId: string, status: SourcingRequestStatus) {
    const docRef = doc(db, 'sourcingRequests', requestId);
    await updateDoc(docRef, { status });

    // Notify the customer who created the request
    const requestSnap = await getDoc(docRef);
    if (requestSnap.exists()) {
        const requestData = requestSnap.data() as SourcingRequest;
        await createNotification({
            userId: requestData.customerId,
            type: 'SOURCING_REQUEST_UPDATE',
            text: `Your sourcing request #${requestId.slice(0, 6)} has been updated to "${status}".`,
            link: `/corporate/sourcing-requests`
        });
    }
}
