
import { collection, onSnapshot, getDoc, doc, addDoc, deleteDoc, writeBatch, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export type CampaignType = 'Sale' | 'Promotion' | 'Flash Sale';
export type CampaignStatus = 'Active' | 'Draft' | 'Scheduled' | 'Finished';
export type CampaignAudience = 'All' | 'New Customers' | 'Returning Customers';
export type DiscountType = 'Percentage' | 'Fixed Amount';
export type CampaignAction = {
    type: 'Apply Discount';
    discountType: DiscountType;
    discountValue: number;
    appliesTo: 'Entire Order' | 'Specific Products';
    productIds?: string[];
} | {
    type: 'Free Shipping';
};

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: any; // Firestore Timestamp
  endDate: any; // Firestore Timestamp
  description?: string;
  audience?: CampaignAudience;
  action?: CampaignAction;
}

const MOCK_CAMPAIGNS: Omit<Campaign, 'id'>[] = [
    {
        name: 'Holiday Kick-off Sale',
        type: 'Sale',
        status: 'Active',
        startDate: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 5))),
        endDate: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() + 10))),
    },
    {
        name: 'New Year, New Gear',
        type: 'Promotion',
        status: 'Scheduled',
        startDate: Timestamp.fromDate(new Date(new Date().getFullYear() + 1, 0, 1)),
        endDate: Timestamp.fromDate(new Date(new Date().getFullYear() + 1, 0, 15)),
    },
    {
        name: 'Black Friday Flash Sale',
        type: 'Flash Sale',
        status: 'Finished',
        startDate: Timestamp.fromDate(new Date(new Date().getFullYear() - 1, 10, 24)),
        endDate: Timestamp.fromDate(new Date(new Date().getFullYear() - 1, 10, 24, 23, 59, 59)),
    },
    {
        name: 'Spring Refresh (Draft)',
        type: 'Sale',
        status: 'Draft',
        startDate: Timestamp.fromDate(new Date(new Date().getFullYear(), 2, 1)),
        endDate: Timestamp.fromDate(new Date(new Date().getFullYear(), 2, 15)),
    }
];

let hasSeeded = false;

async function seedMarketingCampaigns() {
    if (hasSeeded) return;
    const campaignsRef = collection(db, "marketingCampaigns");
    const snapshot = await getDocs(campaignsRef);
    if (snapshot.empty) {
        console.log("Seeding marketing campaigns...");
        const batch = writeBatch(db);
        MOCK_CAMPAIGNS.forEach(campaign => {
            const docRef = doc(campaignsRef);
            batch.set(docRef, campaign);
        });
        await batch.commit();
        console.log("Marketing campaigns seeded.");
    }
    hasSeeded = true;
}

// --- Service Functions ---

// Get all campaigns with real-time updates
export function onCampaignsUpdate(callback: (campaigns: Campaign[]) => void): () => void {
    const campaignsRef = collection(db, 'marketingCampaigns');

    seedMarketingCampaigns().then(() => {
        onSnapshot(campaignsRef, (snapshot) => {
            const campaignsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as Campaign));
            // Sort by start date, most recent first
            campaignsData.sort((a, b) => b.startDate.toDate() - a.startDate.toDate());
            callback(campaignsData);
        });
    });

    return () => console.log("Marketing campaigns listener detached.");
}

// Duplicate a campaign
export async function duplicateCampaign(campaignId: string) {
    const originalCampaignRef = doc(db, 'marketingCampaigns', campaignId);
    const originalCampaignSnap = await getDoc(originalCampaignRef);

    if (!originalCampaignSnap.exists()) {
        throw new Error('Campaign not found');
    }

    const originalData = originalCampaignSnap.data();
    const newCampaignData = {
        ...originalData,
        name: `${originalData.name} (Copy)`,
        status: 'Draft',
    };

    await addDoc(collection(db, 'marketingCampaigns'), newCampaignData);
}

// Delete a campaign
export async function deleteCampaign(campaignId: string) {
    const campaignRef = doc(db, 'marketingCampaigns', campaignId);
    await deleteDoc(campaignRef);
}
