
'use client';

import { collection, onSnapshot, doc, getDocs, writeBatch, updateDoc, Timestamp, query, where, limit, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderItem, OrderStatus } from './orders-service';
import type { VendorOrder } from '@/app/vendor/personalized/orders/page';

const MOCK_ORDERS: Omit<Order, 'id'>[] = [
    {
        customer: {
            id: 'user001',
            name: 'Alice Johnson',
            email: 'alice.j@example.com',
            avatar: 'https://i.pravatar.cc/40?u=user001',
            shippingAddress: '123 Maple St, Springfield, IL',
            pincode: '62704'
        },
        items: [
            { id: '1', name: 'Artisanal Chocolate Box', vendor: 'Gourmet Delights', price: '₹45.00', image: 'https://picsum.photos/600/400?random=1', rating: 4.8, customizable: true, quantity: 1, category: "Food & Drink", featured: true, vendorId: 'vendor001', status: 'Live', customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], mainVariantId: null, allowedCustomizations: ['Text', 'Image Upload'], packaging: { weight: 0, dimensions: { l: 0, w: 0, h: 0 } }, preparationTime: { min: 3, max: 4}, preparationTimeUnit: 'days', name_lowercase: 'artisanal chocolate box' },
            { id: '2', name: 'Luxury Spa Set', vendor: 'Serene Moments', price: '₹85.00', image: 'https://picsum.photos/600/400?random=2', rating: 4.9, customizable: false, quantity: 1, category: 'Wellness', featured: true, vendorId: 'vendor002', status: 'Live', customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], mainVariantId: null, allowedCustomizations: [], packaging: { weight: 0, dimensions: { l: 0, w: 0, h: 0 } }, preparationTime: { min: 3, max: 4}, preparationTimeUnit: 'days', name_lowercase: 'luxury spa set' },
        ],
        status: 'Delivered',
        statusTimeline: [{ status: 'Delivered', at: Timestamp.fromDate(new Date(2023, 10, 5)) }],
        date: Timestamp.fromDate(new Date(2023, 10, 5)),
        subtotal: 130.00,
        shipping: 10.00,
        total: 140.00,
        payment: { method: 'Visa **** 4242', transactionId: 'txn_1', status: 'Paid' },
        commission: 13.00,
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
                    const price = parseFloat(item.price.replace('₹', ''));
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
