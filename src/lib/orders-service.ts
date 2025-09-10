

import { collection, onSnapshot, doc, getDocs, writeBatch, updateDoc, Timestamp, query, where, limit, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, CustomizationSide, ProductVariant } from './products';
import type { VendorOrder } from '@/app/vendor/personalized/orders/page';
import { createNotification } from './notifications-actions';

export interface CustomizationDetails {
    side: CustomizationSide;
    proofUrl: string;
    printUrl: string;
}

export interface OrderItem extends Product {
    quantity: number;
    customizations?: CustomizationDetails[];
    selectedVariant?: ProductVariant; // Add selected variant
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Packaging' | 'Dispatched' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface Order {
    id: string;
    customer: {
        id: string;
        name:string;
        email: string;
        avatar?: string;
        shippingAddress: string;
        pincode: string;
    };
    items: OrderItem[];
    status: OrderStatus;
    statusTimeline: { status: OrderStatus; at: Timestamp }[];
    date: any;
    subtotal: number;
    shipping: number;
    total: number;
    payment: {
        method: string;
        status: PaymentStatus;
        transactionId: string;
        razorpayPaymentId?: string;
        razorpayOrderId?: string;
    };
    shippingDetails?: {
        shipmentId: string;
        trackingNumber: string;
        courierName: string;
        awb: string;
    };
}


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
            { id: 1, name: 'Artisanal Chocolate Box', vendor: 'Gourmet Delights', price: '₹45.00', image: 'https://picsum.photos/600/400?random=1', rating: 4.8, customizable: true, quantity: 1, category: "Food & Drink", featured: true, vendorId: 'vendor001', status: 'Live', customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], mainVariantId: null, allowedCustomizations: ['Text', 'Image Upload'], weight: 1, dimensions: { l: 8, w: 6, h: 2 }, inventoryBuffer: 5, tags: ['chocolate', 'gourmet', 'gift box'], preparationTime: 4, platform: 'Personalized', shipsFromPincode: '400001', createdAt: new Date(), updatedAt: new Date(), sku: '', hsnSac: '', taxRate: 0, mrp: 0, vendorSP: 0, platformBufferRate: 0, vendorCommissionRate: 0, packaging: { weight: 0, dimensions: { l: 0, w: 0, h: 0 } }, customizationSides: { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } } },
            { id: 2, name: 'Luxury Spa Set', vendor: 'Serene Moments', price: '₹85.00', image: 'https://picsum.photos/600/400?random=2', rating: 4.9, customizable: false, quantity: 1, category: 'Wellness', featured: true, vendorId: 'vendor002', status: 'Live', customizationAreas: { front: [], back: [], left: [], right: [], top: [], bottom: [] }, variants: [], mainVariantId: null, allowedCustomizations: [], weight: 3, dimensions: { l: 10, w: 8, h: 4 }, inventoryBuffer: 2, tags: ['spa', 'wellness', 'self-care', 'bath'], preparationTime: 3, tieredPricing: [], platform: 'Personalized', shipsFromPincode: '560001', createdAt: new Date(), updatedAt: new Date(), sku: '', hsnSac: '', taxRate: 0, mrp: 0, vendorSP: 0, platformBufferRate: 0, vendorCommissionRate: 0, packaging: { weight: 0, dimensions: { l: 0, w: 0, h: 0 } }, customizationSides: { front: { image: null, areas: [] }, back: { image: null, areas: [] }, left: { image: null, areas: [] }, right: { image: null, areas: [] }, top: { image: null, areas: [] }, bottom: { image: null, areas: [] } } },
        ],
        status: 'Delivered',
        statusTimeline: [{ status: 'Delivered', at: Timestamp.fromDate(new Date(2023, 10, 5)) }],
        date: Timestamp.fromDate(new Date(2023, 10, 5)),
        subtotal: 130.00,
        shipping: 10.00,
        total: 140.00,
        payment: { method: 'Visa **** 4242', transactionId: 'txn_1', status: 'Paid' }
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


// Update an order's status
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const orderRef = doc(db, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status });
        
        // After updating, send notifications
        const orderSnap = await getDoc(orderRef);

        if(orderSnap.exists()){
            const orderData = orderSnap.data() as Order;
            
            // Notify the customer
            await createNotification({
                userId: orderData.customer.id,
                type: 'ORDER_STATUS_UPDATE',
                text: `Your order #${orderId.slice(0, 8)} has been updated to "${status}".`,
                link: `/account/orders/${orderId}`,
            });

            // Notify the admin
            await createNotification({
                userId: 'admin', // A generic ID for admin notifications
                forAdmin: true,
                type: 'ORDER_STATUS_UPDATE',
                text: `Order #${orderId.slice(0, 8)} was updated to "${status}" by vendor.`,
                link: `/admin/orders?id=${orderId}`,
            });
        }

    } catch (error) {
        console.error("Error updating order status: ", error);
        // Handle error appropriately in UI
        throw error;
    }
}
