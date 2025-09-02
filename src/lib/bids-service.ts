
import { collection, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';

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
    products: Pick<Product, 'id' | 'name' | 'image' | 'vendor'>[];
    quantity: number;
    status: BidStatus;
    dateCreated: string;
    dateExpires: string;
    vendorResponses: VendorResponse[];
}

const MOCK_BIDS: Omit<Bid, 'id'>[] = [
    {
        customerId: 'corp-123',
        products: [
            { id: 6, name: 'Custom Engraved Pen', image: 'https://picsum.photos/600/400?random=6', vendor: 'Signature Gifts' },
            { id: 3, name: 'Handcrafted Leather Wallet', image: 'https://picsum.photos/600/400?random=3', vendor: 'Heritage Wares' },
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
            { id: 7, name: 'Smart Water Bottle', image: 'https://picsum.photos/600/400?random=7', vendor: 'Techie Gifts' },
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
            { id: 4, name: 'Gourmet Coffee Collection', image: 'https://picsum.photos/600/400?random=4', vendor: 'The Daily Grind' },
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
