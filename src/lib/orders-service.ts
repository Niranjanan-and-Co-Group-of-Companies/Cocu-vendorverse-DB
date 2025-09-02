
import { collection, onSnapshot, doc, getDocs, writeBatch, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';

export interface OrderItem extends Product {
    quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

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
            { id: 1, name: 'Artisanal Chocolate Box', vendor: 'Gourmet Delights', price: '$45.00', image: 'https://picsum.photos/600/400?random=1', rating: 4.8, customizable: true, quantity: 1, category: 'Food & Drink', featured: true },
            { id: 2, name: 'Luxury Spa Set', vendor: 'Serene Moments', price: '$85.00', image: 'https://picsum.photos/600/400?random=2', rating: 4.9, customizable: false, quantity: 1, category: 'Wellness', featured: true },
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
            { id: 6, name: 'Custom Engraved Pen', vendor: 'Signature Gifts', price: '$95.00', image: 'https://picsum.photos/600/400?random=6', rating: 4.6, customizable: true, quantity: 2, category: 'Office & Corporate', featured: true },
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
            { id: 4, name: 'Gourmet Coffee Collection', vendor: 'The Daily Grind', price: '$55.00', image: 'https://picsum.photos/600/400?random=4', rating: 4.8, customizable: false, quantity: 1, category: 'Food & Drink', featured: true },
        ],
        status: 'Processing',
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
            { id: 8, name: 'Personalized Star Map', vendor: 'Cosmic Prints', price: '$50.00', image: 'https://picsum.photos/600/400?random=8', rating: 4.9, customizable: true, quantity: 1, category: 'Home & Decor', featured: false },
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
            { id: 7, name: 'Smart Water Bottle', vendor: 'Techie Gifts', price: '$60.00', image: 'https://picsum.photos/600/400?random=7', rating: 4.5, customizable: false, quantity: 3, category: 'Tech', featured: false },
        ],
        status: 'Cancelled',
        date: Timestamp.fromDate(new Date(2023, 9, 20)),
        subtotal: 180.00,
        shipping: 20.00,
        total: 200.00,
        payment: { method: 'Visa **** 4242', transactionId: 'txn_5' }
    },
];

let hasSeeded = false;

async function seedOrders() {
    if (hasSeeded) return;
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    if (snapshot.empty) {
        console.log("Seeding initial orders...");
        const batch = writeBatch(db);
        MOCK_ORDERS.forEach(order => {
            const docRef = doc(ordersRef);
            batch.set(docRef, order);
        });
        await batch.commit();
        console.log("Orders seeded.");
    }
    hasSeeded = true;
}


// --- Main Service Functions ---

// Get all orders with real-time updates
export function onOrdersUpdate(callback: (orders: Order[]) => void): () => void {
    const ordersRef = collection(db, 'orders');

    const processSnapshot = (snapshot: any) => {
        const ordersData = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        } as Order));
        callback(ordersData.sort((a, b) => b.date.toMillis() - a.date.toMillis())); // Sort by newest first
    };

    seedOrders().then(() => {
        onSnapshot(ordersRef, processSnapshot, (error) => {
            console.error("Error fetching orders:", error);
        });
    });

    // Return a dummy unsubscribe function for now, but in a real app, this would be the actual unsubscribe function
    return () => console.log("Orders listener detached.");
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

    