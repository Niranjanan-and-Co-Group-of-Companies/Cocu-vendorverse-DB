
import { collection, onSnapshot, doc, getDocs, writeBatch, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';
import type { VendorOrder } from '@/app/vendor/personalized/orders/page';

export interface OrderItem extends Product {
    quantity: number;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Packaging' | 'Dispatched' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
    id: string;
    customer: {
        id: string;
        name:string;
        email: string;
        avatar?: string;
        shippingAddress: string;
    };
    items: OrderItem[];
    status: OrderStatus;
    date: any; // Firestore Timestamp
    subtotal: number;
    shipping: number;
    total: number;
    payment: {
        method: string;
        transactionId: string;
    };
}


const MOCK_ORDERS: Omit<Order, 'id'>[] = [
    {
        customer: {
            id: 'user001',
            name: 'Alice Johnson',
            email: 'alice.j@example.com',
            avatar: 'https://i.pravatar.cc/40?u=user001',
            shippingAddress: '123 Maple St, Springfield, IL 62704'
        },
        items: [
            { id: 1, name: 'Artisanal Chocolate Box', vendor: 'Gourmet Delights', price: '$45.00', image: 'https://picsum.photos/600/400?random=1', rating: 4.8, customizable: true, quantity: 1, category: 'Food & Drink', featured: true, vendorId: 'vendor001', status: 'Live', customizationSides: { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 0, dimensions: { l: 0, w: 0, h: 0 }, inventoryBuffer: 0, tags: [], galleryImages: [] },
            { id: 2, name: 'Luxury Spa Set', vendor: 'Serene Moments', price: '$85.00', image: 'https://picsum.photos/600/400?random=2', rating: 4.9, customizable: false, quantity: 1, category: 'Wellness', featured: true, vendorId: 'vendor002', status: 'Live', customizationSides: { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 0, dimensions: { l: 0, w: 0, h: 0 }, inventoryBuffer: 0, tags: [], galleryImages: [] },
        ],
        status: 'Delivered',
        date: Timestamp.fromDate(new Date(2023, 10, 5)),
        subtotal: 130.00,
        shipping: 10.00,
        total: 140.00,
        payment: { method: 'Visa **** 4242', transactionId: 'txn_1' }
    },
    {
        customer: {
            id: 'user002',
            name: 'Bob Williams',
            email: 'bob.w@example.com',
            avatar: 'https://i.pravatar.cc/40?u=user002',
            shippingAddress: '456 Oak Ave, Metropolis, IL 62960'
        },
        items: [
            { id: 6, name: 'Custom Engraved Pen', vendor: 'Signature Gifts', price: '$95.00', image: 'https://picsum.photos/600/400?random=6', rating: 4.6, customizable: true, quantity: 2, category: 'Office & Corporate', featured: true, vendorId: 'vendor006', status: 'Live', customizationSides: { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 0, dimensions: { l: 0, w: 0, h: 0 }, inventoryBuffer: 0, tags: [], galleryImages: [] },
        ],
        status: 'Shipped',
        date: Timestamp.fromDate(new Date(2023, 10, 10)),
        subtotal: 190.00,
        shipping: 15.00,
        total: 205.00,
        payment: { method: 'Mastercard **** 5555', transactionId: 'txn_2' }
    },
    {
        customer: {
            id: 'user003',
            name: 'Charlie Brown',
            email: 'charlie.b@example.com',
            avatar: 'https://i.pravatar.cc/40?u=user003',
            shippingAddress: '789 Pine Ln, Smallville, KS 66604'
        },
        items: [
            { id: 4, name: 'Gourmet Coffee Collection', vendor: 'The Daily Grind', price: '$55.00', image: 'https://picsum.photos/600/400?random=4', rating: 4.8, customizable: false, quantity: 1, category: 'Food & Drink', featured: true, vendorId: 'vendor004', status: 'Live', customizationSides: { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 0, dimensions: { l: 0, w: 0, h: 0 }, inventoryBuffer: 0, tags: [], galleryImages: [] },
        ],
        status: 'Preparing',
        date: Timestamp.fromDate(new Date(2023, 10, 12)),
        subtotal: 55.00,
        shipping: 5.00,
        total: 60.00,
        payment: { method: 'PayPal', transactionId: 'txn_3' }
    },
    {
        customer: {
            id: 'user004',
            name: 'Diana Prince',
            email: 'diana.p@example.com',
            avatar: 'https://i.pravatar.cc/40?u=user004',
            shippingAddress: '1 Paradise Island, Themyscira, 12345'
        },
        items: [
            { id: 8, name: 'Personalized Star Map', vendor: 'Gourmet Delights', price: '$50.00', image: 'https://picsum.photos/600/400?random=8', rating: 4.9, customizable: true, quantity: 1, category: 'Home & Decor', featured: false, vendorId: 'vendor001', status: 'Live', customizationSides: { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 0, dimensions: { l: 0, w: 0, h: 0 }, inventoryBuffer: 0, tags: [], galleryImages: [] },
        ],
        status: 'Pending',
        date: Timestamp.fromDate(new Date(2023, 10, 15)),
        subtotal: 50.00,
        shipping: 10.00,
        total: 60.00,
        payment: { method: 'Visa **** 1111', transactionId: 'txn_4' }
    },
    {
        customer: {
            id: 'user001',
            name: 'Alice Johnson',
            email: 'alice.j@example.com',
            avatar: 'https://i.pravatar.cc/40?u=user001',
            shippingAddress: '123 Maple St, Springfield, IL 62704'
        },
        items: [
            { id: 7, name: 'Smart Water Bottle', vendor: 'Gourmet Delights', price: '$60.00', image: 'https://picsum.photos/600/400?random=7', rating: 4.5, customizable: false, quantity: 3, category: 'Tech', featured: false, vendorId: 'vendor001', status: 'Live', customizationSides: { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } }, allowedCustomizations: [], weight: 0, dimensions: { l: 0, w: 0, h: 0 }, inventoryBuffer: 0, tags: [], galleryImages: [] },
        ],
        status: 'Cancelled',
        date: Timestamp.fromDate(new Date(2023, 9, 20)),
        subtotal: 180.00,
        shipping: 20.00,
        total: 200.00,
        payment: { method: 'Visa **** 4242', transactionId: 'txn_5' }
    },
];

async function seedOrders() {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        MOCK_ORDERS.forEach(order => {
            const docRef = doc(ordersRef);
            batch.set(docRef, order);
        });
        await batch.commit();
    }
}


// --- Main Service Functions ---

// Get all orders for Admin view with real-time updates
export function onOrdersUpdate(callback: (orders: Order[]) => void): () => void {
    const ordersRef = collection(db, 'orders');

    const processSnapshot = (snapshot: any) => {
        const ordersData = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        } as Order));
        callback(ordersData.sort((a, b) => b.date.toMillis() - a.date.toMillis())); // Sort by newest first
    };

    seedOrders();
    
    const unsubscribe = onSnapshot(ordersRef, processSnapshot, (error) => {
        console.error("Error fetching orders:", error);
    });

    return unsubscribe;
}

// Get all orders for a specific VENDOR with real-time updates
export function onVendorOrdersUpdate(vendorName: string, callback: (orders: VendorOrder[]) => void): () => void {
    const ordersRef = collection(db, 'orders');
    // NOTE: Firestore doesn't support 'array-contains' with complex objects well.
    // A better data model would have a vendorId array on the order document.
    // For now, we fetch all and filter client-side. This is NOT scalable.
    const q = query(ordersRef);

    seedOrders();

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const vendorOrders: VendorOrder[] = [];
        snapshot.forEach(docSnap => {
            const order = { id: docSnap.id, ...docSnap.data() } as Order;
            const vendorItems = order.items.filter(item => item.vendor === vendorName);

            if (vendorItems.length > 0) {
                const vendorTotal = vendorItems.reduce((sum, item) => {
                    const price = parseFloat(item.price.replace('$', ''));
                    return sum + (price * item.quantity);
                }, 0);

                vendorOrders.push({
                    ...order,
                    vendorTotal,
                    vendorItemCount: vendorItems.length,
                });
            }
        });
        // Sort by newest first
        vendorOrders.sort((a, b) => b.date.toMillis() - a.date.toMillis());
        callback(vendorOrders);
    });

    return unsubscribe;
}


// Update an order's status
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const orderRef = doc(db, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status });
        console.log(`Order ${orderId} status updated to ${status}`);
    } catch (error) {
        console.error("Error updating order status: ", error);
        // Handle error appropriately in UI
        throw error;
    }
}
