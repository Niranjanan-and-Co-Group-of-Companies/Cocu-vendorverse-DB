
'use client';

import { create } from 'zustand';
import type { Product } from '@/lib/products';

// This will be replaced by the actual service types later
export interface Conversation {
    id: string;
    product: {
        id: string;
        name: string;
        image: string;
    };
    vendor: {
        id: string;
        name: string;
    };
    lastMessage: {
        text: string;
        timestamp: any;
    };
    unreadCount: number;
    status: 'Active' | 'Locked';
    messageCount: number;
    attachmentsCount: number;
}

interface NewConversationInfo {
    vendorId: string;
    productId: string;
    productName: string;
    productImage: string;
    vendorName: string;
}

interface CorporateChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  isSafetyNoticeOpen: boolean;
  newConversationInfo: NewConversationInfo | null;
  selectConversation: (conversation: Conversation) => void;
  openChat: (product: Product) => void;
  initiateNewConversation: (info: NewConversationInfo) => void;
  closeSafetyNotice: (shouldProceed: boolean) => void;
}

export const useCorporateChat = create<CorporateChatState>((set, get) => ({
    conversations: [],
    selectedConversation: null,
    isLoading: true,
    isSafetyNoticeOpen: false,
    newConversationInfo: null,
    
    selectConversation: (conversation) => {
        set({ selectedConversation: conversation });
        // Later, this will also mark the conversation as read
    },

    openChat: (product) => {
        set({ 
            isSafetyNoticeOpen: true, 
            newConversationInfo: {
                vendorId: product.vendorId,
                productId: String(product.id),
                productName: product.name,
                productImage: product.image,
                vendorName: product.vendor,
            }
        });
    },

    initiateNewConversation: (info) => {
        // This will be replaced by logic to find or create a conversation
        console.log('Finding or creating conversation for:', info);
        // For now, let's just log it.
    },

    closeSafetyNotice: (shouldProceed) => {
        if (shouldProceed && get().newConversationInfo) {
            const info = get().newConversationInfo!;
            // The router logic will be handled inside the component
        }
        set({ isSafetyNoticeOpen: false, newConversationInfo: null });
    },
}));
