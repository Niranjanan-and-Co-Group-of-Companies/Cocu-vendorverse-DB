

import { collection, onSnapshot, query, where, orderBy, limit, Timestamp, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import type { Order, OrderItem, OrderStatus } from '../orders-service';
import type { Product } from '../products';

export interface CorporateDashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeBids: number;
  newBidsToday: number;
  unreadMessages: number;
  actionableMessages: number;
  activeListings: number;
  b2bEnabledListings: number;
}

export interface VendorNotification {
  id: string;
  vendorId: string;
  type: 'NEW_ORDER' | 'NEW_MESSAGE' | 'NEW_BID' | 'ACTION_REQUIRED';
  text: string;
  timestamp: Timestamp;
  isRead: boolean;
  link?: string;
  actor?: { name: string; avatar?: string; };
  actionable?: boolean;
}

export function onCorporateDashboardStatsUpdate(vendorName: string, callback: (stats: CorporateDashboardStats) => void): Unsubscribe {
    let stats: Partial<CorporateDashboardStats> = {
        totalRevenue: 0,
        revenueChange: 0,
        activeBids: 0,
        newBidsToday: 0,
        unreadMessages: 0,
        actionableMessages: 0,
        activeListings: 0,
        b2bEnabledListings: 0,
    };

    const combinedCallback = () => {
        callback(stats as CorporateDashboardStats);
    }

    const ordersRef = collection(db, 'orders');
    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
        let totalRevenue = 0;
        snapshot.docs.forEach(doc => {
            const order = doc.data() as Order;
            order.items.forEach(item => {
                if (item.vendor === vendorName && order.status === 'Delivered') {
                    totalRevenue += parseFloat(item.price.replace('$', '')) * item.quantity;
                }
            });
        });
        stats.totalRevenue = totalRevenue;
        stats.revenueChange = (totalRevenue / 75000) * 100;
        combinedCallback();
    });

    const productsRef = collection(db, 'products');
    const productsQuery = query(productsRef, where('vendor', '==', vendorName));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
        stats.activeListings = snapshot.docs.filter(d => d.data().status === 'Live').length;
        stats.b2bEnabledListings = snapshot.docs.filter(d => d.data().moq && d.data().moq > 1).length;
        combinedCallback();
    });
    
    // Mock data for bids for now
    stats.activeBids = 5;
    stats.newBidsToday = 2;
    stats.unreadMessages = 3;
    stats.actionableMessages = 1;
    combinedCallback();

    return () => {
        unsubOrders();
        unsubProducts();
    };
}


export function onCorporateRecentActivityUpdate(vendorName: string, callback: (notifications: VendorNotification[]) => void): Unsubscribe {
  // This is mock data for now. It should be replaced with a real Firestore listener on a 'corporateNotifications' collection.
  const mockActivities: VendorNotification[] = [
    { id: '1', vendorId: vendorName, type: 'NEW_BID', text: "New bid request for 'Custom Engraved Pen'", timestamp: Timestamp.fromMillis(Date.now() - 3600000), isRead: false, link: '#', actor: { name: 'Globex Corporation' } },
    { id: '2', vendorId: vendorName, type: 'NEW_MESSAGE', text: "Inquiry about bulk pricing for 'Artisanal Chocolate Box'", timestamp: Timestamp.fromMillis(Date.now() - 7200000), isRead: false, link: '#', actor: { name: 'Jane Doe' } },
    { id: '3', vendorId: vendorName, type: 'NEW_ORDER', text: "New bulk order #C-5678 placed.", timestamp: Timestamp.fromMillis(Date.now() - 86400000), isRead: true, link: '#', actor: { name: 'Soylent Corp' } },
  ];
  callback(mockActivities);
  
  // Return a no-op unsubscribe function as this is mock data
  return () => {};
}
