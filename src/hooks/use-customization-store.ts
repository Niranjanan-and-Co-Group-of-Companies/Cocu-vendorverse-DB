'use client';

import { create } from 'zustand';
import type { CustomizationElement } from '@/lib/customization';

// --- Store Definition ---

interface CustomizationState {
  elements: CustomizationElement[];
  addElement: (element: Omit<CustomizationElement, 'id'>) => void;
  updateElement: (id: string, newProps: Partial<CustomizationElement>) => void;
  removeElement: (id: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
}

export const useCustomizationStore = create<CustomizationState>()((set) => ({
    elements: [],
    selectedElementId: null,

    addElement: (element) => {
        const newElement: CustomizationElement = {
            id: `el_${Date.now()}`,
            ...element,
        };
        set(state => ({ elements: [...state.elements, newElement] }));
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

    setSelectedElementId: (id) => {
        set({ selectedElementId: id });
    }
}));
