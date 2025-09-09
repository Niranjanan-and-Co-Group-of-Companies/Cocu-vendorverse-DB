
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { AnimatePresence, motion } from 'framer-motion';
import { TextToolbar } from './text-toolbar';

export function ContextualToolbar() {
    const { selectedElementId, elements } = useCustomization();
    const selectedElement = elements.find(el => el.id === selectedElementId);

    const toolbarContent = () => {
        if (!selectedElement) return null;

        switch (selectedElement.type) {
            case 'text':
                return <TextToolbar />;
            // Add cases for other element types here
            // case 'image':
            //     return <ImageToolbar />;
            default:
                return null;
        }
    };

    return (
        <div className="absolute top-[3.75rem] left-0 right-0 z-20 flex justify-center pointer-events-none">
            <AnimatePresence>
                {selectedElement && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        className="pointer-events-auto"
                    >
                        <div className="bg-card p-2 rounded-lg border shadow-lg flex items-center gap-2">
                             {toolbarContent()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
