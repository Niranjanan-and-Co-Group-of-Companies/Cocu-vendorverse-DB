

'use server';

import { collection, onSnapshot, getDocs, writeBatch, doc, updateDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notifications-actions';

export interface VendorKYC {
    currentStep: number; // e.g., 1 for PAN, 2 for Bank, etc.
    status: 'Not Started' | 'In Progress' | 'Pending Review' | 'Verified' | 'Failed';
    panStatus: 'Pending' | 'Verified' | 'Failed' | 'Not Submitted';
    bankAccountStatus: 'Pending' | 'Verified' | 'Failed' | 'Not Submitted';
    addressProofStatus: 'Pending' | 'Verified' | 'Failed' | 'Not Submitted';
    gstinStatus: 'Pending' | 'Verified' | 'Failed' | 'Not Submitted' | 'Not Applicable';
    rejectionReason?: string; // Optional field for feedback on failure
}

export interface VendorAddress {
  id: string;
  label: string; // "Primary Warehouse", "Secondary Office"
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate: any; // Keep as any to handle Firestore Timestamps
  pickupAddresses: VendorAddress[];
  gstProfile: {
      gstin: string;
      legalName: string;
      stateCode: string;
  };
  banking: {
      beneficiary: string;
      ifsc: string;
      accountNoMasked: string; // e.g., "********1234"
  };
  payoutConfig: {
      settlementHoldDays: number;
      logisticsPayer: 'vendor' | 'customer' | 'shared';
  };
  kyc: VendorKYC;
}

const MOCK_VENDORS: Omit<Vendor, 'id' | 'joinedDate'>[] = [
    { name: 'Gourmet Delights', email: 'contact@gourmetdelights.com', phone: '9876543210', avatar: 'https://i.pravatar.cc/40?u=vendor001', status: 'Active', pickupAddresses: [{ id: 'addr1', label: 'Main Kitchen', street: '123 Foodie Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', isDefault: true }], gstProfile: { gstin: '27AAAAA0000A1Z5', legalName: 'Gourmet Delights Pvt Ltd', stateCode: '27' }, banking: { beneficiary: 'Gourmet Delights Pvt Ltd', ifsc: 'HDFC0000001', accountNoMasked: '********1234' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'customer'}, kyc: { currentStep: 4, status: 'Verified', panStatus: 'Verified', bankAccountStatus: 'Verified', addressProofStatus: 'Verified', gstinStatus: 'Verified' } },
    { name: 'Serene Moments', email: 'support@serenemoments.co', phone: '9876543211', avatar: 'https://i.pravatar.cc/40?u=vendor002', status: 'Active', pickupAddresses: [{ id: 'addr1', label: 'Warehouse A', street: '456 Wellness Way', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India', isDefault: true }], gstProfile: { gstin: '', legalName: '', stateCode: '' }, banking: { beneficiary: 'Serene Moments Inc', ifsc: 'ICIC0000002', accountNoMasked: '********5678' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'vendor'}, kyc: { currentStep: 4, status: 'Verified', panStatus: 'Verified', bankAccountStatus: 'Verified', addressProofStatus: 'Verified', gstinStatus: 'Not Applicable' } },
    { name: 'Heritage Wares', email: 'info@heritagewares.com', phone: '9876543212', avatar: 'https://i.pravatar.cc/40?u=vendor003', status: 'Pending', pickupAddresses: [{ id: 'addr1', label: 'Workshop', street: '789 Craft Circle', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', country: 'India', isDefault: true }], gstProfile: { gstin: '', legalName: '', stateCode: '' }, banking: { beneficiary: '', ifsc: '', accountNoMasked: '' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'customer'}, kyc: { currentStep: 1, status: 'In Progress', panStatus: 'Not Submitted', bankAccountStatus: 'Not Submitted', addressProofStatus: 'Not Submitted', gstinStatus: 'Not Submitted' } },
];


async function seedVendors() {
    const vendorsRef = collection(db, "vendors");
    const snapshot = await getDocs(vendorsRef);
    if (snapshot.empty) {
        console.log("Seeding vendors...");
        const batch = writeBatch(db);
        MOCK_VENDORS.forEach(vendor => {
            const docRef = doc(vendorsRef);
            batch.set(docRef, vendor);
        });
        await batch.commit();
    }
}


/**
 * Fetches all vendors from the database.
 * @returns A promise that resolves to an array of Vendor objects.
 */
export async function getVendors(): Promise<Vendor[]> {
    await seedVendors();
    const vendorsRef = collection(db, "vendors");
    const snapshot = await getDocs(vendorsRef);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
}

export async function getVendorById(id: string): Promise<Vendor | null> {
    if (!id) return null;
    const docRef = doc(db, 'vendors', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Vendor : null;
}

export type VendorSignupData = {
    storeName: string;
    firstName: string;
    lastName: string;
    email: string;
};

export async function createVendorApplication(vendorData: VendorSignupData): Promise<string> {
    const newVendorRef = await addDoc(collection(db, 'vendors'), {
        name: vendorData.storeName,
        email: vendorData.email,
        phone: '', // Placeholder
        avatar: `https://i.pravatar.cc/40?u=${vendorData.email}`,
        status: 'Pending',
        joinedDate: serverTimestamp(),
        // Initialize empty profiles
        pickupAddresses: [],
        gstProfile: { gstin: '', legalName: '', stateCode: ''},
        banking: { beneficiary: '', ifsc: '', accountNoMasked: ''},
        payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'customer'},
        kyc: { currentStep: 1, status: 'Not Started', panStatus: 'Not Submitted', bankAccountStatus: 'Not Submitted', addressProofStatus: 'Not Submitted', gstinStatus: 'Not Submitted' }
    });

    await createNotification({
        userId: 'admin',
        forAdmin: true,
        type: 'NEW_VENDOR_SUBMISSION',
        text: `New vendor application from ${vendorData.storeName}.`,
        link: `/admin/vendors`
    });

    return newVendorRef.id;
}
