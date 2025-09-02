

import { collection, onSnapshot, query, where, orderBy, limit, Timestamp, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import type { Order, OrderItem, OrderStatus } from '../orders-service';
import type { Product } from '../products';


// --- Data Types ---
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number; // Percentage change from last month
  activeOrders: number;
  newOrdersToday: number;
  unreadMessages: number;
  actionableMessages: number;
  activeListings: number;
  draftListings: number;
}

export interface VendorNotification {
  id: string;
  vendorId: string;
  type: 'NEW_ORDER' | 'NEW_MESSAGE' | 'STOCK_ALERT' | 'ACTION_REQUIRED';
  text: string;
  timestamp: Timestamp;
  isRead: boolean;
  link?: string;
  actor?: {
    name: string;
    avatar?: string;
  };
  actionable?: boolean;
}


// --- Real-time Listeners ---

/**
 * Subscribes to dashboard statistics for a specific vendor.
 * This function sets up multiple real-time listeners and combines their results.
 */
export function onDashboardStatsUpdate(vendorName: string, callback: (stats: DashboardStats) => void): Unsubscribe {
    let stats: Partial<DashboardStats> = {
        totalRevenue: 0,
        activeOrders: 0,
        activeListings: 0,
        // Mocking values that are harder to compute for this example
        revenueChange: (Math.random() * 20) - 10,
        newOrdersToday: Math.floor(Math.random() * 5),
        unreadMessages: Math.floor(Math.random() * 10),
        actionableMessages: Math.floor(Math.random() * 3),
        draftListings: Math.floor(Math.random() * 10),
    };

    const ordersRef = collection(db, 'orders');
    const productsRef = collection(db, 'products');

    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
        let totalRevenue = 0;
        let activeOrders = 0;
        
        snapshot.docs.forEach(doc => {
            const order = doc.data() as Order;
            let vendorItemsInOrder: OrderItem[] = [];

            order.items.forEach(item => {
                if (item.vendor === vendorName) {
                    vendorItemsInOrder.push(item);
                }
            });

            if (vendorItemsInOrder.length > 0) {
                 // Count as an active order if it's pending or processing
                const activeStatus: OrderStatus[] = ['Pending', 'Processing', 'Shipped'];
                if (activeStatus.includes(order.status)) {
                    activeOrders++;
                }
                
                // Calculate revenue only from delivered orders
                if (order.status === 'Delivered') {
                    vendorItemsInOrder.forEach(item => {
                        totalRevenue += parseFloat(item.price.replace('$', '')) * item.quantity;
                    });
                }
            }
        });

        stats.totalRevenue = totalRevenue;
        stats.activeOrders = activeOrders;
        callback(stats as DashboardStats);
    });

    const productsQuery = query(productsRef, where('vendor', '==', vendorName));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
        stats.activeListings = snapshot.size;
        callback(stats as DashboardStats);
    });

    // The final unsubscribe function will detach both listeners
    return () => {
        unsubOrders();
        unsubProducts();
    };
}


/**
 * Subscribes to recent activity notifications for a vendor.
 */
export function onRecentActivityUpdate(vendorName: string, callback: (notifications: VendorNotification[]) => void): Unsubscribe {
  // Firestore doesn't support querying based on properties of objects in an array directly.
  // In a real, scalable app, when an order is created, a cloud function would
  // create a separate notification document for each vendor involved.
  // For this simulation, we'll fetch all notifications and filter client-side.
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    // where('vendorName', '==', vendorName), // This would be the ideal query
    orderBy('timestamp', 'desc'),
    limit(20) // Fetch more and filter
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    // This is a placeholder as we don't have a notifications collection yet.
    // We will use the mock data approach for now.
    if (snapshot.empty) {
        const mockActivities: VendorNotification[] = [
            { id: '1', vendorId: vendorName, type: 'NEW_ORDER', text: 'Order #3124 for Artisanal Chocolate Box', timestamp: Timestamp.fromMillis(Date.now() - 300000), isRead: false, actor: { name: 'Olivia Martin', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d' }},
            { id: '2', vendorId: vendorName, type: 'NEW_MESSAGE', text: 'Question about Custom Engraved Pen', timestamp: Timestamp.fromMillis(Date.now() - 900000), isRead: false, actor: { name: 'Jackson Lee', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026705d' }},
            { id: '3', vendorId: vendorName, type: 'ACTION_REQUIRED', text: 'Customer wants to buy "Handcrafted Leather Wallet". Please approve.', timestamp: Timestamp.fromMillis(Date.now() - 1800000), isRead: false, actor: { name: 'Liam Brown', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026709d' }, actionable: true},
            { id: '4', vendorId: vendorName, type: 'NEW_ORDER', text: 'Order #3123 for Luxury Spa Set', timestamp: Timestamp.fromMillis(Date.now() - 3600000), isRead: true, actor: {name: 'Isabella Nguyen', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026706d'}},
            { id: '5', vendorId: vendorName, type: 'STOCK_ALERT', text: 'Handcrafted Leather Wallet is low on stock (3 left)', timestamp: Timestamp.fromMillis(Date.now() - 7200000), isRead: true },
        ].filter(n => n.vendorId === vendorName);
        callback(mockActivities);
        return;
    }

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as VendorNotification))
    .filter(n => n.vendorId === vendorName); // Manual filter

    callback(notifications);

  }, (error) => {
    console.error("Error fetching vendor notifications:", error);
    callback([]);
  });

  return unsubscribe;
}
