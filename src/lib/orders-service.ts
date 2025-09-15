

'use server';

import { collection, onSnapshot, doc, getDocs, writeBatch, updateDoc, Timestamp, query, where, limit, getDoc, addDoc, serverTimestamp, increment, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, CustomizationSide, ProductVariant, Platform } from './products';
import { createNotification } from './notifications-actions';
import { generateReadableId } from './id-service';
import type { PlainProduct } from './products-service';

export interface CustomizationDetails {
    side: CustomizationSide;
    proofUrl: string;
    printUrl: string;
}

export interface OrderItem extends PlainProduct {
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
    platform: Platform;
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
    try {
        const orderId = await runTransaction(db, async (transaction) => {
            // 1. Verify stock for all items
            for (const item of orderData.items) {
                const productRef = doc(db, 'products', item.id);
                const productSnap = await transaction.get(productRef);
                if (!productSnap.exists() || productSnap.data().stock < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${item.name}`);
                }
            }

            // 2. If all stock is available, proceed to create order and decrement stock
            const orderRef = doc(collection(db, 'orders'));
            const newOrderId = generateReadableId('ORD');
            const newOrderData = {
                ...orderData,
                orderId: newOrderId,
                status: 'Pending' as OrderStatus,
                date: serverTimestamp(),
                statusTimeline: [{ status: 'Pending' as OrderStatus, at: new Date() }],
            };
            transaction.set(orderRef, newOrderData);

            for (const item of orderData.items) {
                const productRef = doc(db, 'products', item.id);
                transaction.update(productRef, { stock: increment(-item.quantity) });
            }
            
            return { orderId: newOrderId, orderRefId: orderRef.id };
        });

        // --- Create Notifications AFTER successful order creation ---
        
        // Notify Admin
        await createNotification({
            userId: 'admin',
            forAdmin: true,
            type: 'NEW_ORDER',
            text: `New order #${orderId.orderId} for ${orderData.total.toFixed(2)} placed by ${orderData.customer.name}.`,
            link: `/admin/orders?orderId=${orderId.orderRefId}`
        });

        // Notify relevant vendors
        const vendorIds = new Set(orderData.items.map(item => item.vendorId));
        for (const vendorId of vendorIds) {
            await createNotification({
                userId: vendorId,
                type: 'NEW_ORDER',
                text: `You have a new order #${orderId.orderId} from ${orderData.customer.name}.`,
                link: `/vendor/personalized/orders`
            });
        }
        
        return { success: true, orderId: orderId.orderRefId };

    } catch (error: any) {
        console.error("Order creation transaction failed: ", error);
        return { success: false, message: error.message };
    }
}
