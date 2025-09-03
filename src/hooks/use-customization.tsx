
'use client';

import * as React from 'react';
import { useCustomizationStore } from './use-customization';

// --- Context and Provider ---

export const CustomizationContext = React.createContext<ReturnType<typeof useCustomizationStore> | null>(null);

export const CustomizationProvider = ({ children }: { children: React.ReactNode }) => {
    // Note: The store is created once and this is a hook to access it.
    // The provider is here to make it available via context if needed, which can be useful
    // for performance optimizations in very complex scenarios, though direct use of the hook is also fine.
    const store = useCustomizationStore();
    return (
        <CustomizationContext.Provider value={store}>
            {children}
        </CustomizationContext.Provider>
    );
};

// Re-export the hook for easy consumption
export const useCustomization = useCustomizationStore;
