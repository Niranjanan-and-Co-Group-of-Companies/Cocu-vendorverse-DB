
import { collection, onSnapshot, getDoc, doc, addDoc, deleteDoc, writeBatch, getDocs, Timestamp, updateDoc, query, where, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { CampaignCreative } from '@/app/admin/marketing/new/page';
import type { Platform } from './products';

export type CampaignType = 'Sale' | 'Promotion' | 'Flash Sale' | 'Content';
export type CampaignStatus = 'Active' | 'Draft' | 'Scheduled' | 'Finished';
export type CampaignAudience = 'All' | 'New Customers' | 'Returning Customers' | 'Corporate';
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
  platform: Platform | 'Both';
  placement: Placement;
  creatives: Omit<CampaignCreative, 'imageFile'>[];
}

// Re-export from promotions-service to avoid circular dependencies
export type { Promotion } from './promotions-service';

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
    
    const unsubscribe = onSnapshot(campaignsRef, (snapshot) => {
        const campaignsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        } as Campaign));
        // Sort by start date, most recent first
        campaignsData.sort((a, b) => b.startDate.toDate() - a.startDate.toDate());
        callback(campaignsData);
    });

    return unsubscribe;
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

// Get active campaign for a specific placement
export async function getActiveCampaignByPlacement(placement: Placement): Promise<Campaign | null> {
    const campaignsRef = collection(db, 'marketingCampaigns');
    const now = Timestamp.now();

    const q = query(
        campaignsRef,
        where('placement', '==', placement),
        where('status', '==', 'Active'),
        where('platform', 'in', ['Personalized', 'Both']),
        where('startDate', '<=', now),
        limit(1) // Get the most recent one that has started
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }

    const campaignDoc = snapshot.docs[0];
    const campaignData = { id: campaignDoc.id, ...campaignDoc.data() } as Campaign;

    // Additional check for end date
    if (campaignData.endDate && campaignData.endDate.toDate() < new Date()) {
        return null; // Campaign has expired
    }

    return campaignData;
}


// Get active campaign for a specific placement
export async function getActiveCorporateCampaignByPlacement(placement: Placement): Promise<Campaign | null> {
    const campaignsRef = collection(db, 'marketingCampaigns');
    const now = Timestamp.now();

    const q = query(
        campaignsRef,
        where('placement', '==', placement),
        where('status', '==', 'Active'),
        where('platform', 'in', ['Corporate', 'Both']),
        where('startDate', '<=', now),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }

    const campaignDoc = snapshot.docs[0];
    const campaignData = { id: campaignDoc.id, ...campaignDoc.data() } as Campaign;

    if (campaignData.endDate && campaignData.endDate.toDate() < new Date()) {
        return null;
    }

    return campaignData;
}
