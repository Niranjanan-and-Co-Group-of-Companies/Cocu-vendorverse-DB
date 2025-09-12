

'use server';

import { collection, onSnapshot, doc, getDocs, writeBatch, updateDoc, Timestamp, query, where, limit, getDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, CustomizationSide, ProductVariant } from './products';
import { createNotification } from './notifications-actions';
import { generateReadableId } from './id-service';

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
    orderId: string; // Human-readable ID
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
    statusTimeline: { status: OrderStatus; at: Date }[];
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
    commission?: number;
}


// Update an order's status
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const orderRef = doc(db, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status, lastUpdated: serverTimestamp() });
        
        // After updating, send notifications
        const orderSnap = await getDoc(orderRef);

        if(orderSnap.exists()){
            const orderData = orderSnap.data() as Order;
            
            // Notify the customer
            await createNotification({
                userId: orderData.customer.id,
                type: 'ORDER_STATUS_UPDATE',
                text: `Your order #${orderData.orderId} has been updated to "${status}".`,
                link: `/account/orders/${orderId}`,
            });

            // Notify the admin
            await createNotification({
                userId: 'admin', // A generic ID for admin notifications
                forAdmin: true,
                type: 'ORDER_STATUS_UPDATE',
                text: `Order #${orderData.orderId} was updated to "${status}".`,
                link: `/admin/orders?id=${orderId}`,
            });
        }

    } catch (error) {
        console.error("Error updating order status: ", error);
        // Handle error appropriately in UI
        throw error;
    }
}


export async function createOrder(orderData: Omit<Order, 'id' | 'orderId' | 'date' | 'status' | 'statusTimeline'>) {
    const batch = writeBatch(db);

    // 1. Create the new order document
    const orderRef = doc(collection(db, 'orders'));
    const orderId = generateReadableId('ORD');
    const newOrderData = {
        ...orderData,
        orderId,
        status: 'Pending' as OrderStatus,
        date: serverTimestamp(),
        statusTimeline: [{ status: 'Pending' as OrderStatus, at: new Date() }],
    };
    batch.set(orderRef, newOrderData);

    // 2. Decrement stock for each item in the order
    for (const item of orderData.items) {
        const productRef = doc(db, 'products', item.id);
        // Use the 'increment' utility with a negative value to decrement stock
        batch.update(productRef, { stock: increment(-item.quantity) });
    }

    // 3. Commit the batch
    await batch.commit();

    // --- Create Notifications AFTER successful order creation ---
    
    // Notify Admin
    await createNotification({
        userId: 'admin',
        forAdmin: true,
        type: 'NEW_ORDER',
        text: `New order #${orderId} for ${orderData.total.toFixed(2)} placed by ${orderData.customer.name}.`,
        link: `/admin/orders?orderId=${orderRef.id}`
    });

    // Notify relevant vendors
    const vendorIds = new Set(orderData.items.map(item => item.vendorId));
    for (const vendorId of vendorIds) {
        await createNotification({
            userId: vendorId,
            type: 'NEW_ORDER',
            text: `You have a new order #${orderId} from ${orderData.customer.name}.`,
            link: `/vendor/personalized/orders` // Generic link, vendor dashboard should highlight new orders.
        });
    }
    
    return { success: true, orderId: orderRef.id };
}


