
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
  getCanvasDataURL: (side: CustomizationSide) => Promise<string | null>;
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

    getCanvasDataURL: async (side) => {
        const { canvasRef, elements } = get();
        if (!canvasRef?.current) return null;

        const sideElements = elements.filter(el => el.side === side);
        if (sideElements.length === 0) return null; // Don't generate image if there are no customizations

        try {
            const canvas = await html2canvas(canvasRef.current, {
                backgroundColor: null, // Transparent background
                logging: false,
                useCORS: true, 
                // Only capture the canvas div itself, not the whole page
                width: canvasRef.current.offsetWidth,
                height: canvasRef.current.offsetHeight,
                windowWidth: canvasRef.current.offsetWidth,
                windowHeight: canvasRef.current.offsetHeight,
            });
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error("Error generating canvas image:", error);
            return null;
        }
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
