
'use client';

import * as React from 'react';
import { create } from 'zustand';
import type { CustomizationElement } from '@/lib/customization';
import type { CustomizationSide } from '@/lib/products';
import html2canvas from 'html2canvas';

// --- Store Definition ---

interface CustomizationState {
  elements: CustomizationElement[];
  addElement: (element: Omit<CustomizationElement, 'id'>) => void;
  updateElement: (id: string, newProps: Partial<CustomizationElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  activeSide: CustomizationSide;
  setActiveSide: (side: CustomizationSide) => void;
  selectedVariantId: string | null;
  setSelectedVariantId: (id: string | null) => void;
  canvasRef: React.RefObject<HTMLDivElement> | null;
  setCanvasRef: (ref: React.RefObject<HTMLDivElement>) => void;
  getCanvasDataURLs: (side: CustomizationSide) => Promise<{ proofUrl: string | null; printUrl: string | null; }>;
}

const useCustomizationStore = create<CustomizationState>()((set, get) => ({
    elements: [],
    selectedElementId: null,
    activeSide: 'front',
    selectedVariantId: null,
    canvasRef: null,

    addElement: (element) => {
        const { activeSide } = get();
        const newElement: CustomizationElement = {
            id: `el_${Date.now()}`,
            ...element,
            side: activeSide, // Assign the current active side
        };
        set(state => ({ 
            elements: [...state.elements, newElement],
            selectedElementId: newElement.id 
        }));
    },

    updateElement: (id, newProps) => {
        set(state => ({
            elements: state.elements.map(el =>
                el.id === id ? { ...el, ...newProps } : el
            ),
        }));
    },

    removeElement: (id) => {
        set(state => ({
            elements: state.elements.filter(el => el.id !== id),
            selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        }));
    },
    
    duplicateElement: (id) => {
        const { elements } = get();
        const elementToDuplicate = elements.find(el => el.id === id);
        if (elementToDuplicate) {
            const newElement: CustomizationElement = {
                ...elementToDuplicate,
                id: `el_${Date.now()}`,
                x: elementToDuplicate.x + 10,
                y: elementToDuplicate.y + 10,
            };
             set(state => ({
                elements: [...state.elements, newElement],
                selectedElementId: newElement.id
            }));
        }
    },

    setSelectedElementId: (id) => {
        set({ selectedElementId: id });
    },

    setActiveSide: (side) => {
        set({ activeSide: side, selectedElementId: null }); // Deselect when changing side
    },
    
    setSelectedVariantId: (id) => {
        set({ selectedVariantId: id, activeSide: 'front', selectedElementId: null }); // Reset to front side and deselect elements
    },
    
    setCanvasRef: (ref) => {
        set({ canvasRef: ref });
    },

    getCanvasDataURLs: async (side) => {
        const { canvasRef, elements, activeSide: currentActiveSide, setActiveSide } = get();
        if (!canvasRef?.current) return { proofUrl: null, printUrl: null };

        const sideElements = elements.filter(el => el.side === side);
        if (sideElements.length === 0) {
            return { proofUrl: null, printUrl: null };
        }
        
        // Temporarily switch to the target side to render its elements
        if (side !== currentActiveSide) {
            setActiveSide(side);
            // Wait for re-render
            await new Promise(resolve => setTimeout(resolve, 50)); 
        }
        
        const canvasContainer = canvasRef.current;
        const previouslySelectedId = get().selectedElementId;
        set({ selectedElementId: null }); // Deselect all elements to hide handles

        await new Promise(resolve => setTimeout(resolve, 50)); // Wait for deselection to render

        // Generate the proof URL (with product background)
        const proofCanvas = await html2canvas(canvasContainer, {
            backgroundColor: null,
            logging: false,
            useCORS: true,
        });
        const proofUrl = proofCanvas.toDataURL('image/png');

        // Generate the print URL (transparent background)
        const printCanvas = await html2canvas(canvasContainer, {
            backgroundColor: null, 
            logging: false,
            useCORS: true,
            ignoreElements: (element) => element.id === 'canvas-image',
        });
        const printUrl = printCanvas.toDataURL('image/png');

        // Restore previous state
        if (side !== currentActiveSide) {
             setActiveSide(currentActiveSide);
        }
        set({ selectedElementId: previouslySelectedId });

        return { proofUrl, printUrl };
    }
}));


// --- Context and Provider ---
export const CustomizationContext = React.createContext<ReturnType<typeof useCustomizationStore> | null>(null);

export const CustomizationProvider = ({ children }: { children: React.ReactNode }) => {
    const store = useCustomizationStore();
    return (
        <CustomizationContext.Provider value={store}>
            {children}
        </CustomizationContext.Provider>
    );
};

// Re-export the hook for easy consumption
export const useCustomization = useCustomizationStore;
