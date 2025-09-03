

import { collection, onSnapshot, getDocs, writeBatch, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from './firebase';
import type { Product } from './products';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createNotification } from './notifications-service';

export type BidStatus = 'Active' | 'Awarded' | 'Expired';

export interface VendorResponse {
    vendorId: string;
    vendorName: string;
    pricePerUnit: number;
    estimatedDeliveryDays: number;
}

export interface Bid {
    id: string;
    customerId: string;
    products: Pick<Product, 'id' | 'name' | 'image' | 'vendor' | 'vendorId'>[];
    quantity: number;
    status: BidStatus;
    dateCreated: any;
    dateExpires: any;
    vendorResponses: VendorResponse[];
    deliveryTimeline?: string;
    pincode?: string;
    notes?: string;
    briefUrls?: string[];
}

const MOCK_BIDS: Omit<Bid, 'id'>[] = [
    {
        customerId: 'corp-123',
        products: [
            { id: 6, name: 'Custom Engraved Pen', image: 'https://picsum.photos/600/400?random=6', vendor: 'Signature Gifts', vendorId: 'vendor006' },
            { id: 3, name: 'Handcrafted Leather Wallet', image: 'https://picsum.photos/600/400?random=3', vendor: 'Heritage Wares', vendorId: 'vendor003' },
        ],
        quantity: 250,
        status: 'Active',
        dateCreated: new Date(2023, 10, 1).toISOString(),
        dateExpires: new Date(2023, 10, 30).toISOString(),
        vendorResponses: [
            { vendorId: 'vendor-01', vendorName: 'Signature Gifts', pricePerUnit: 85.50, estimatedDeliveryDays: 20 },
            { vendorId: 'vendor-02', vendorName: 'Corporate Swag Co.', pricePerUnit: 82.00, estimatedDeliveryDays: 25 },
        ]
    },
    {
        customerId: 'corp-456',
        products: [
            { id: 7, name: 'Smart Water Bottle', image: 'https://picsum.photos/600/400?random=7', vendor: 'Techie Gifts', vendorId: 'vendor007' },
        ],
        quantity: 500,
        status: 'Awarded',
        dateCreated: new Date(2023, 9, 15).toISOString(),
        dateExpires: new Date(2023, 10, 15).toISOString(),
        vendorResponses: [
            { vendorId: 'vendor-03', vendorName: 'Techie Gifts', pricePerUnit: 52.00, estimatedDeliveryDays: 30 },
            { vendorId: 'vendor-04', vendorName: 'Gadget Gurus', pricePerUnit: 55.50, estimatedDeliveryDays: 28 },
            { vendorId: 'vendor-05', vendorName: 'Innovate Inc.', pricePerUnit: 50.75, estimatedDeliveryDays: 35 },
        ]
    },
    {
        customerId: 'corp-789',
        products: [
            { id: 4, name: 'Gourmet Coffee Collection', image: 'https://picsum.photos/600/400?random=4', vendor: 'The Daily Grind', vendorId: 'vendor004' },
        ],
        quantity: 100,
        status: 'Expired',
        dateCreated: new Date(2023, 8, 1).toISOString(),
        dateExpires: new Date(2023, 9, 1).toISOString(),
        vendorResponses: [
            { vendorId: 'vendor-06', vendorName: 'The Daily Grind', pricePerUnit: 50.00, estimatedDeliveryDays: 10 },
        ]
    },
];

async function seedBids() {
    const bidsRef = collection(db, "corporateBids");
    const snapshot = await getDocs(bidsRef);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        MOCK_BIDS.forEach(bid => {
            const docRef = doc(bidsRef);
            batch.set(docRef, bid);
        });
        await batch.commit();
    }
}


// Get all bids with real-time updates
export function onBidsUpdate(callback: (bids: Bid[]) => void): () => void {
    const bidsRef = collection(db, 'corporateBids');

    const processSnapshot = (snapshot: any) => {
        const bidsData = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        } as Bid));
        callback(bidsData.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()));
    };

    seedBids();

    const unsubscribe = onSnapshot(bidsRef, processSnapshot, (error) => {
        console.error("Error fetching bids:", error);
    });

    return unsubscribe;
}

// Create a new bid
export async function createBid(data: {
    products: Pick<Product, 'id' | 'name' | 'image' | 'vendor' | 'vendorId'>[];
    quantity: number;
    pincode: string;
    deliveryTimeline: string;
    biddingDuration: '24' | '48';
    notes: string;
    briefFiles: File[];
}) {
    let briefUrls: string[] = [];
    if (data.briefFiles && data.briefFiles.length > 0) {
        const uploadPromises = data.briefFiles.map(file => {
            const storageRef = ref(storage, `bids/${Date.now()}_${file.name}`);
            return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
        });
        briefUrls = await Promise.all(uploadPromises);
    }
    
    const now = new Date();
    const expires = new Date(now.getTime() + parseInt(data.biddingDuration, 10) * 60 * 60 * 1000);
    
    // In a real app, customer name would come from auth context.
    const customerName = "A Corporate Client"; 
    const customerId = "corp-123";

    const newBid = {
        customerId: customerId,
        products: data.products,
        quantity: data.quantity,
        status: 'Active' as BidStatus,
        dateCreated: serverTimestamp(),
        dateExpires: expires.toISOString(),
        vendorResponses: [],
        pincode: data.pincode,
        deliveryTimeline: data.deliveryTimeline,
        notes: data.notes,
        briefUrls,
    };

    const bidRef = await addDoc(collection(db, 'corporateBids'), newBid);
    
    // --- Notification Logic ---
    // 1. Notify Admin
    await createNotification({
        userId: 'admin',
        forAdmin: true,
        type: 'NEW_BID_RESPONSE', // This should probably be a new type like NEW_BID_REQUEST
        text: `New bid request #${bidRef.id.slice(0,6)} created by ${customerName}.`,
        link: `/admin/bids?id=${bidRef.id}`
    });

    // 2. Notify relevant vendors
    const uniqueVendorIds = new Set(data.products.map(p => p.vendorId));
    for (const vendorId of uniqueVendorIds) {
        if (!vendorId) continue;
        await createNotification({
            userId: vendorId,
            type: 'NEW_BID_RESPONSE', // Also should be a new type
            text: `You have a new bid request from ${customerName}.`,
            link: `/vendor/corporate/bids/${bidRef.id}`
        });
    }
}
