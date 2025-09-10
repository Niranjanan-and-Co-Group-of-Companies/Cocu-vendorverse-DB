
'use server';

import { collection, onSnapshot, doc, getDocs, writeBatch, updateDoc, Timestamp, query, where, limit, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, CustomizationSide, ProductVariant } from './products';
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
    commission?: number;
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
                text: `Order #${orderId.slice(0, 8)} was updated to "${status}".`,
                link: `/admin/orders?id=${orderId}`,
            });
        }

    } catch (error) {
        console.error("Error updating order status: ", error);
        // Handle error appropriately in UI
        throw error;
    }
}


export async function createOrder(orderData: Omit<Order, 'id' | 'date' | 'status' | 'statusTimeline'>) {
    await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'Pending',
        date: serverTimestamp(),
        statusTimeline: [{ status: 'Pending', at: serverTimestamp() }],
    });
}
