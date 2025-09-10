
'use client';

import { create } from 'zustand';
import type { Product } from '@/lib/products';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect } from 'react';

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
  isReady: boolean; // Add a ready state
  isSafetyNoticeOpen: boolean;
  newConversationInfo: NewConversationInfo | null;
  selectConversation: (conversation: Conversation) => void;
  openChat: (product: Product) => void;
  initiateNewConversation: (info: NewConversationInfo) => void;
  closeSafetyNotice: (shouldProceed: boolean) => void;
}

const useCorporateChatStore = create(
    persist<CorporateChatState>(
        (set, get) => ({
            conversations: [],
            selectedConversation: null,
            isLoading: false, // Set to false initially
            isReady: false,
            isSafetyNoticeOpen: false,
            newConversationInfo: null,
            
            selectConversation: (conversation) => {
                set({ selectedConversation: conversation });
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
                const existingConversation = get().conversations.find(
                    c => c.product.id === info.productId && c.vendor.id === info.vendorId
                );
        
                if (existingConversation) {
                    set({ selectedConversation: existingConversation });
                } else {
                    // Create a new placeholder conversation and add it to the list
                    const newConversation: Conversation = {
                        id: `conv_${info.productId}_${info.vendorId}`,
                        product: {
                            id: info.productId,
                            name: info.productName,
                            image: info.productImage,
                        },
                        vendor: {
                            id: info.vendorId,
                            name: info.vendorName,
                        },
                        lastMessage: { text: "Hi, I have a question about this product.", timestamp: new Date() },
                        unreadCount: 0,
                        status: 'Active',
                        messageCount: 0,
                        attachmentsCount: 0,
                    };
                    set(state => ({
                        conversations: [newConversation, ...state.conversations],
                        selectedConversation: newConversation,
                    }));
                }
            },
        
            closeSafetyNotice: (shouldProceed) => {
                if (shouldProceed && get().newConversationInfo) {
                    // Logic is handled in the dialog component
                }
                set({ isSafetyNoticeOpen: false, newConversationInfo: null });
            },
        }),
        {
            name: 'corporate-chat-storage',
            storage: createJSONStorage(() => localStorage),
             onRehydrateStorage: () => (state) => {
                if (state) state.isReady = true;
            },
        }
    )
);

// Custom hook to prevent hydration errors with zustand persist middleware
export const useCorporateChat = () => {
  const store = useCorporateChatStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? store : {
    conversations: [],
    selectedConversation: null,
    isLoading: true,
    isReady: false,
    isSafetyNoticeOpen: false,
    newConversationInfo: null,
    selectConversation: () => {},
    openChat: () => {},
    initiateNewConversation: () => {},
    closeSafetyNotice: () => {},
  };
};
