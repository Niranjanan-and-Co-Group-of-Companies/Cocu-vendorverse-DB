
'use server';

import { collection, onSnapshot, getDocs, writeBatch, doc, updateDoc, getDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notifications-actions';
import { generateReadableId } from './id-service';

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

export type VendorType = 'personalized' | 'corporate' | 'both';

export interface Vendor {
  id: string;
  vendorId: string; // Human-readable ID
  name: string;
  email: string;
  phone: string;
  avatar: string;
  type: VendorType;
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

export type PlainVendor = Omit<Vendor, 'joinedDate'> & {
  joinedDate: string | null;
};

export async function serializeVendor(vendor: Vendor): Promise<PlainVendor> {
  const plainVendor = { ...vendor } as any;

  if (vendor.joinedDate && typeof vendor.joinedDate.toDate === 'function') {
    plainVendor.joinedDate = vendor.joinedDate.toDate().toISOString();
  } else {
    plainVendor.joinedDate = null;
  }

  return plainVendor as PlainVendor;
}

const MOCK_VENDORS: Omit<Vendor, 'id' | 'joinedDate' | 'vendorId'>[] = [
    { name: 'Gourmet Delights', email: 'contact@gourmetdelights.com', phone: '+919876543210', avatar: 'https://i.pravatar.cc/40?u=vendor001', type: 'both', status: 'Active', pickupAddresses: [{ id: 'addr1', label: 'Main Kitchen', street: '123 Foodie Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', isDefault: true }], gstProfile: { gstin: '27AAAAA0000A1Z5', legalName: 'Gourmet Delights Pvt Ltd', stateCode: '27' }, banking: { beneficiary: 'Gourmet Delights Pvt Ltd', ifsc: 'HDFC0000001', accountNoMasked: '********1234' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'customer'}, kyc: { currentStep: 4, status: 'Verified', panStatus: 'Verified', bankAccountStatus: 'Verified', addressProofStatus: 'Verified', gstinStatus: 'Verified' } },
    { name: 'Serene Moments', email: 'support@serenemoments.co', phone: '+919876543211', avatar: 'https://i.pravatar.cc/40?u=vendor002', type: 'personalized', status: 'Active', pickupAddresses: [{ id: 'addr1', label: 'Warehouse A', street: '456 Wellness Way', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India', isDefault: true }], gstProfile: { gstin: '', legalName: '', stateCode: '' }, banking: { beneficiary: 'Serene Moments Inc', ifsc: 'ICIC0000002', accountNoMasked: '********5678' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'vendor'}, kyc: { currentStep: 4, status: 'Verified', panStatus: 'Verified', bankAccountStatus: 'Verified', addressProofStatus: 'Verified', gstinStatus: 'Not Applicable' } },
    { name: 'Heritage Wares', email: 'info@heritagewares.com', phone: '+919876543212', avatar: 'https://i.pravatar.cc/40?u=vendor003', type: 'corporate', status: 'Pending', pickupAddresses: [{ id: 'addr1', label: 'Workshop', street: '789 Craft Circle', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', country: 'India', isDefault: true }], gstProfile: { gstin: '', legalName: '', stateCode: '' }, banking: { beneficiary: '', ifsc: '', accountNoMasked: '' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'customer'}, kyc: { currentStep: 1, status: 'In Progress', panStatus: 'Not Submitted', bankAccountStatus: 'Not Submitted', addressProofStatus: 'Not Submitted', gstinStatus: 'Not Submitted' } },
    { name: 'The Daily Grind', email: 'hello@dailygrind.coffee', phone: '+919876543213', avatar: 'https://i.pravatar.cc/40?u=vendor004', type: 'personalized', status: 'Active', pickupAddresses: [{ id: 'addr1', label: 'Roastery', street: '101 Coffee Bean Blvd', city: 'Chikmagalur', state: 'Karnataka', pincode: '577101', country: 'India', isDefault: true }], gstProfile: { gstin: '', legalName: '', stateCode: '' }, banking: { beneficiary: 'The Daily Grind', ifsc: 'SBIN0000123', accountNoMasked: '********1122' }, payoutConfig: { settlementHoldDays: 2, logisticsPayer: 'customer' }, kyc: { currentStep: 4, status: 'Verified', panStatus: 'Verified', bankAccountStatus: 'Verified', addressProofStatus: 'Verified', gstinStatus: 'Not Applicable' } }
];


async function seedVendors() {
    const vendorsRef = collection(db, "vendors");
    const snapshot = await getDocs(vendorsRef);
    if (snapshot.empty) {
        console.log("Seeding vendors...");
        const batch = writeBatch(db);
        MOCK_VENDORS.forEach(vendor => {
            const docRef = doc(vendorsRef);
            batch.set(docRef, { ...vendor, vendorId: generateReadableId('VDR'), joinedDate: serverTimestamp() });
        });
        await batch.commit();
    }
}

seedVendors();


export async function getVendors(): Promise<PlainVendor[]> {
    const vendorsRef = collection(db, "vendors");
    const snapshot = await getDocs(vendorsRef);
    if (snapshot.empty) {
        return [];
    }
    const vendors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
    return Promise.all(vendors.map(serializeVendor));
}

export async function getVendorById(id: string): Promise<PlainVendor | null> {
    if (!id) return null;
    const docRef = doc(db, 'vendors', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const vendor = { id: docSnap.id, ...docSnap.data() } as Vendor;
        return await serializeVendor(vendor);
    }
    return null;
}

export type VendorSignupData = {
    storeName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    vendorType: VendorType;
};

export async function checkVendorExists(email: string, phone: string): Promise<{ exists: boolean, message?: string }> {
    const vendorsRef = collection(db, 'vendors');
    const emailQuery = query(vendorsRef, where('email', '==', email));
    const phoneQuery = query(vendorsRef, where('phone', '==', phone));

    const [emailSnapshot, phoneSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(phoneQuery)
    ]);

    if (!emailSnapshot.empty) {
        return { exists: true, message: "An account with this email address already exists." };
    }
    if (!phoneSnapshot.empty) {
        return { exists: true, message: "An account with this phone number already exists." };
    }

    return { exists: false };
}


export async function createVendorApplication(vendorData: VendorSignupData): Promise<string> {
    const vendorsRef = collection(db, 'vendors');

    const newVendorRef = await addDoc(collection(db, 'vendors'), {
        name: vendorData.storeName,
        email: vendorData.email,
        phone: `+91${vendorData.phone}`,
        type: vendorData.vendorType,
        vendorId: generateReadableId('VDR'),
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
        link: `/admin/vendors?new_id=${newVendorRef.id}`
    });

    return newVendorRef.id;
}


export async function updateVendorSettings(vendorId: string, data: Partial<Vendor>) {
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, data);
}

