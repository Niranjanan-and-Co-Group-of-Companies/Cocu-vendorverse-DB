
'use server';

import { collection, onSnapshot, query, where, orderBy, limit, Timestamp, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';

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

// In a real app, vendorId would come from the authenticated user's session.
// We are hardcoding it for now.

// --- Real-time Listeners ---

/**
 * Subscribes to dashboard statistics for a specific vendor.
 * This is a simplified simulation. A real implementation would involve
 * more complex queries, potentially denormalized data, or Cloud Functions
 * to calculate these stats efficiently.
 */
export function onDashboardStatsUpdate(vendorId: string, callback: (stats: DashboardStats) => void): Unsubscribe {
  // This is a simplified mock listener. We'll return static data
  // but wrap it in a structure that mimics a real-time listener.
  // In a production app, you would have separate listeners for orders, products, etc.
  
  const getMockStats = () => {
    const stats: DashboardStats = {
      totalRevenue: Math.floor(Math.random() * 50000) + 10000,
      revenueChange: (Math.random() * 40) - 10,
      activeOrders: Math.floor(Math.random() * 20),
      newOrdersToday: Math.floor(Math.random() * 5),
      unreadMessages: Math.floor(Math.random() * 10),
      actionableMessages: Math.floor(Math.random() * 3),
      activeListings: Math.floor(Math.random() * 100) + 20,
      draftListings: Math.floor(Math.random() * 10),
    };
    callback(stats);
  };
  
  // Simulate initial fetch
  getMockStats();

  // Simulate real-time updates every 10 seconds
  const intervalId = setInterval(getMockStats, 10000);

  // The unsubscribe function
  return () => clearInterval(intervalId);
}

/**
 * Subscribes to recent activity notifications for a vendor.
 */
export function onRecentActivityUpdate(vendorId: string, callback: (notifications: VendorNotification[]) => void): Unsubscribe {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('vendorId', '==', vendorId),
    orderBy('timestamp', 'desc'),
    limit(5)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
        // Return mock data if no real notifications exist yet
        const mockActivities: VendorNotification[] = [
            { id: '1', vendorId, type: 'NEW_ORDER', text: 'Order #3124 for Artisanal Chocolate Box', timestamp: Timestamp.fromMillis(Date.now() - 300000), isRead: false, actor: { name: 'Olivia Martin', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d' }},
            { id: '2', vendorId, type: 'NEW_MESSAGE', text: 'Question about Custom Engraved Pen', timestamp: Timestamp.fromMillis(Date.now() - 900000), isRead: false, actor: { name: 'Jackson Lee', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026705d' }},
            { id: '3', vendorId, type: 'ACTION_REQUIRED', text: 'Customer wants to buy "Handcrafted Leather Wallet". Please approve.', timestamp: Timestamp.fromMillis(Date.now() - 1800000), isRead: false, actor: { name: 'Liam Brown', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026709d' }, actionable: true},
            { id: '4', vendorId, type: 'STOCK_ALERT', text: 'Handcrafted Leather Wallet is low on stock (3 left)', timestamp: Timestamp.fromMillis(Date.now() - 7200000), isRead: true },
        ];
        callback(mockActivities);
        return;
    }

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as VendorNotification));
    callback(notifications);
  }, (error) => {
    console.error("Error fetching vendor notifications:", error);
    callback([]);
  });

  return unsubscribe;
}
