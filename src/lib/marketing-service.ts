
import { collection, onSnapshot, getDoc, doc, addDoc, deleteDoc, writeBatch, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { CampaignCreative } from '@/app/admin/marketing/new/page';

export type CampaignType = 'Sale' | 'Promotion' | 'Flash Sale' | 'Content';
export type CampaignStatus = 'Active' | 'Draft' | 'Scheduled' | 'Finished';
export type CampaignAudience = 'All' | 'New Customers' | 'Returning Customers';
export type Placement = 'homepage-hero' | 'top-banner' | 'popup-modal' | 'category-banner';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: any; // Firestore Timestamp
  endDate: any; // Firestore Timestamp
  description?: string;
  audience?: CampaignAudience;
  placement: Placement;
  creatives: Omit<CampaignCreative, 'imageFile'>[];
}

const MOCK_CAMPAIGNS: Omit<Campaign, 'id'|'placement'|'creatives'>[] = [
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
            batch.set(docRef, {
              ...campaign,
              placement: 'homepage-hero',
              creatives: [{
                id: '1',
                title: 'Mock Creative',
                description: 'This is a mock creative.',
                ctaText: 'Shop Now',
                ctaLink: '#',
                imageUrl: 'https://picsum.photos/1200/800'
              }]
            });
        });
        await batch.commit();
        console.log("Marketing campaigns seeded.");
    }
    hasSeeded = true;
}

// --- Image Upload ---
async function uploadFile(file: File): Promise<string> {
    const storageRef = ref(storage, `campaigns/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
}


// --- Service Functions ---

export async function getCampaignById(id: string): Promise<Campaign | null> {
    const docRef = doc(db, 'marketingCampaigns', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Campaign;
    }
    return null;
}


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

// Create or Update a campaign
export async function saveCampaign(campaignData: Campaign) {
    const { id, ...data } = campaignData;

    // 1. Handle image uploads
    const processedCreatives = await Promise.all(
        (data.creatives as (CampaignCreative | Omit<CampaignCreative, 'imageFile'>)[]).map(async (creative) => {
            if ('imageFile' in creative && creative.imageFile) {
                const imageUrl = await uploadFile(creative.imageFile);
                const { imageFile, ...rest } = creative;
                return { ...rest, imageUrl };
            }
            // If there's no new file, just return the creative data as is
             const { ...rest } = creative as any;
             delete rest.imageFile;
             return rest;
        })
    );
    
    const finalData = { ...data, creatives: processedCreatives };

    if (id) {
        // Update existing campaign
        const docRef = doc(db, 'marketingCampaigns', id);
        await updateDoc(docRef, finalData);
    } else {
        // Create new campaign
        await addDoc(collection(db, 'marketingCampaigns'), finalData);
    }
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
