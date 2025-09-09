
'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

type AuditAction = 
    // Admin Actions
    | 'ADMIN_LOGIN'
    | 'ADMIN_UPDATE_COMMISSION'
    | 'ADMIN_UPDATE_PROMOTION'
    | 'ADMIN_UPDATE_TERMS'
    | 'ADMIN_APPROVE_PRODUCT'
    | 'ADMIN_DECLINE_PRODUCT'
    | 'ADMIN_APPROVE_VENDOR_KYC'
    | 'ADMIN_REJECT_VENDOR_KYC'
    // Vendor Actions
    | 'VENDOR_LOGIN'
    | 'VENDOR_CREATE_PRODUCT'
    | 'VENDOR_UPDATE_PRODUCT'
    | 'VENDOR_UPDATE_ORDER_STATUS'
    // System Actions
    | 'SYSTEM_CREATE_INVOICE'
    | 'SYSTEM_PROCESS_PAYOUT';

interface AuditLog {
    actor: {
        id: string; // User or Vendor ID, or "system"
        role: 'admin' | 'vendor' | 'customer' | 'system';
        ipAddress?: string; // Optional
    };
    action: AuditAction;
    target: {
        type: string; // e.g., 'product', 'order', 'vendor'
        id: string;
    };
    details: Record<string, any>; // For before/after state, etc.
    timestamp: any;
}

/**
 * Creates an audit log entry.
 * @param logData - The data for the audit log, excluding the timestamp.
 */
export async function createAuditLog(logData: Omit<AuditLog, 'timestamp'>) {
    try {
        await addDoc(collection(db, 'audits'), {
            ...logData,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
        // In a real app, you might want more robust error handling,
        // like logging to a dedicated error service.
    }
}
