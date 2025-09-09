
import { collection, onSnapshot, query, where, orderBy, limit, Timestamp, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import type { Order, OrderItem, OrderStatus } from '../orders-service';
import type { Product } from '../products';
import { onUserNotificationsUpdate, type Notification } from '../notifications-service';


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

export interface VendorNotification extends Notification {}


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
        newOrdersToday: 0,
        unreadMessages: 0,
        actionableMessages: 0,
        activeListings: 0,
        draftListings: 0,
    };

    let lastRevenue = 0;

    const ordersRef = collection(db, 'orders');
    const productsRef = collection(db, 'products');
    
    const combinedCallback = () => {
        // Calculate revenue change based on a static monthly goal for simplicity
        const monthlyGoal = 50000;
        if (monthlyGoal > 0) {
            stats.revenueChange = (stats.totalRevenue! / monthlyGoal) * 100;
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

    // Mocking message stats for now
    stats.unreadMessages = 3;
    stats.actionableMessages = 1;
    combinedCallback();


    return () => {
        unsubOrders();
        unsubProducts();
    };
}


/**
 * Subscribes to recent activity notifications for a vendor.
 */
export function onRecentActivityUpdate(vendorId: string, callback: (notifications: VendorNotification[]) => void): Unsubscribe {
  // Re-using the generic user notification service
  return onUserNotificationsUpdate(vendorId, callback as (notifications: Notification[]) => void);
}
