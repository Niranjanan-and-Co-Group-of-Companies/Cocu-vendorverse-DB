
'use client';

import * as React from 'react';
import { create } from 'zustand';
import type { CorporateClient } from '@/lib/corporate-clients-service';
import { onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

// In a real app, this would come from an auth context.
const MOCK_CORPORATE_CLIENT_ID = 'zR2K8aaI11ueHqC3K24r'; 

interface CorporateAccountState {
  account: CorporateClient | null;
  isLoading: boolean;
  setAccount: (account: CorporateClient | null) => void;
  updateClientProfile: (data: Partial<Pick<CorporateClient, 'name' | 'contactPerson' | 'email' | 'phone'>>) => Promise<void>;
  updateGstProfile: (gstin: string, legalName: string) => Promise<void>;
}

const useCorporateAccountStore = create<CorporateAccountState>((set, get) => ({
  account: null,
  isLoading: true,
  setAccount: (account) => set({ account, isLoading: false }),
  updateClientProfile: async (data) => {
    const account = get().account;
    if (!account) return;
    try {
        const clientRef = doc(db, 'corporateClients', account.id);
        await updateDoc(clientRef, data);
        toast({ title: 'Profile Updated', description: 'Your company profile has been successfully updated.' });
    } catch (error) {
        console.error("Failed to update profile", error);
        toast({ title: 'Error', description: 'Could not update your profile.', variant: 'destructive' });
    }
  },
  updateGstProfile: async (gstin, legalName) => {
     const account = get().account;
    if (!account) return;
    try {
        const clientRef = doc(db, 'corporateClients', account.id);
        const updateData = {
            gstProfile: { gstin, legalName },
            gstStatus: 'Pending',
        };
        await updateDoc(clientRef, updateData as any);
        toast({ title: 'GST Details Submitted', description: 'Your GST information has been submitted for verification.' });
    } catch (error) {
         console.error("Failed to update GST profile", error);
         toast({ title: 'Error', description: 'Could not save your GST details.', variant: 'destructive' });
    }
  },
}));

// This provider component fetches the data and hydrates the store.
export const CorporateAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }): React.ReactElement => {
  const setAccount = useCorporateAccountStore(state => state.setAccount);

  React.useEffect(() => {
    if (!MOCK_CORPORATE_CLIENT_ID) {
      setAccount(null);
      return;
    }
    const clientRef = doc(db, 'corporateClients', MOCK_CORPORATE_CLIENT_ID);
    const unsubscribe = onSnapshot(clientRef, (docSnap) => {
      if (docSnap.exists()) {
        setAccount({ id: docSnap.id, ...docSnap.data() } as CorporateClient);
      } else {
        setAccount(null);
      }
    });

    return () => unsubscribe();
  }, [setAccount]);

  return <>{children}</>;
};


export const useCorporateAccount = useCorporateAccountStore;
