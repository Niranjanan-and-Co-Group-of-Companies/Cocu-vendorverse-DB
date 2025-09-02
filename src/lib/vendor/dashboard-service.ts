

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
    // This will hold the combined stats from all listeners.
    let stats: Partial<DashboardStats> = {
        totalRevenue: 0,
        revenueChange: 0,
        activeOrders: 0,
        newOrdersToday: 0, // This remains a mock value for simplicity
        unreadMessages: 0,
        actionableMessages: 0, // This remains a mock value
        activeListings: 0,
        draftListings: 0, // This remains a mock value
    };

    let lastRevenue = 0;

    const ordersRef = collection(db, 'orders');
    const productsRef = collection(db, 'products');
    const notificationsRef = collection(db, 'notifications');
    
    const combinedCallback = () => {
        // Calculate revenue change based on the last known value
        // This is a simplified approach to show real-time change without heavy historical queries
        if (lastRevenue > 0) {
            stats.revenueChange = ((stats.totalRevenue! - lastRevenue) / lastRevenue) * 100;
        } else if (stats.totalRevenue! > 0) {
            stats.revenueChange = 100;
        } else {
            stats.revenueChange = 0;
        }
        
        callback(stats as DashboardStats);
    }

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
                const activeStatus: OrderStatus[] = ['Pending', 'Processing', 'Shipped'];
                if (activeStatus.includes(order.status)) {
                    activeOrders++;
                }
                
                if (order.status === 'Delivered') {
                    vendorItemsInOrder.forEach(item => {
                        totalRevenue += parseFloat(item.price.replace('$', '')) * item.quantity;
                    });
                }
            }
        });

        lastRevenue = stats.totalRevenue || 0;
        stats.totalRevenue = totalRevenue;
        stats.activeOrders = activeOrders;
        combinedCallback();
    });

    const productsQuery = query(productsRef, where('vendor', '==', vendorName));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
        stats.activeListings = snapshot.size;
        combinedCallback();
    });

    // Real-time listener for unread messages
    const messagesQuery = query(
        notificationsRef, 
        where('vendorId', '==', vendorName),
        where('type', '==', 'NEW_MESSAGE'),
        where('isRead', '==', false)
    );
    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
        stats.unreadMessages = snapshot.size;
        combinedCallback();
    });


    // The final unsubscribe function will detach all listeners
    return () => {
        unsubOrders();
        unsubProducts();
        unsubMessages();
    };
}


/**
 * Subscribes to recent activity notifications for a vendor.
 */
export function onRecentActivityUpdate(vendorName: string, callback: (notifications: VendorNotification[]) => void): Unsubscribe {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const mockActivities: VendorNotification[] = [
        { id: '1', vendorId: vendorName, type: 'NEW_ORDER', text: 'Order #3124 for Artisanal Chocolate Box', timestamp: Timestamp.fromMillis(Date.now() - 300000), isRead: false, actor: { name: 'Olivia Martin', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d' }},
        { id: '2', vendorId: vendorName, type: 'NEW_MESSAGE', text: 'Question about Custom Engraved Pen', timestamp: Timestamp.fromMillis(Date.now() - 900000), isRead: false, actor: { name: 'Jackson Lee', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026705d' }},
        { id: '3', vendorId: vendorName, type: 'ACTION_REQUIRED', text: 'Customer wants to buy "Handcrafted Leather Wallet". Please approve.', timestamp: Timestamp.fromMillis(Date.now() - 1800000), isRead: false, actor: { name: 'Liam Brown', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026709d' }, actionable: true},
        { id: '4', vendorId: vendorName, type: 'NEW_ORDER', text: 'Order #3123 for Luxury Spa Set', timestamp: Timestamp.fromMillis(Date.now() - 3600000), isRead: true, actor: {name: 'Isabella Nguyen', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026706d'}},
        { id: '5', vendorId: vendorName, type: 'STOCK_ALERT', text: 'Handcrafted Leather Wallet is low on stock (3 left)', timestamp: Timestamp.fromMillis(Date.now() - 7200000), isRead: true },
    ].filter(n => n.vendorId === vendorName);
    
    if (snapshot.empty && mockActivities.length > 0) {
        callback(mockActivities);
        return;
    }

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as VendorNotification))
    .filter(n => n.vendorId === vendorName);

    callback(notifications.length > 0 ? notifications : mockActivities);

  }, (error) => {
    console.error("Error fetching vendor notifications:", error);
    callback([]);
  });

  return unsubscribe;
}
