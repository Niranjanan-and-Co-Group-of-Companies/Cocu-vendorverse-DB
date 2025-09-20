
'use server';

import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import type { CustomizationSide } from './products';

export interface CustomizationProof {
  side: CustomizationSide;
  proofUrl: string; // URL to a low-res JPG/PNG for display (with background)
  printUrl: string; // URL to a high-res SVG/PDF for printing (transparent)
}

/**
 * Saves customization data URLs to Firebase Storage.
 * @param productId - The ID of the product being customized.
 * @param side - The product side being saved.
 * @param proofDataUrl - The base64 data URL of the canvas with the product background.
 * @param printDataUrl - The base64 data URL of the canvas with a transparent background (for printing).
 * @returns An object containing the public download URLs for both the proof and print images.
 */
export async function saveCustomizationProof(
    productId: string, 
    side: CustomizationSide, 
    proofDataUrl: string,
    printDataUrl: string,
): Promise<{ proofUrl: string, printUrl: string }> {
  
  try {
    // 1. Upload the transparent "print" version
    const printPath = `customizations/${productId}/print_${side}_${Date.now()}.png`;
    const printStorageRef = ref(storage, printPath);
    const printSnapshot = await uploadString(printStorageRef, printDataUrl, 'data_url');
    const printUrl = await getDownloadURL(printSnapshot.ref);

    // 2. Upload the opaque "proof" version
    const proofPath = `customizations/${productId}/proof_${side}_${Date.now()}.png`;
    const proofStorageRef = ref(storage, proofPath);
    const proofSnapshot = await uploadString(proofStorageRef, proofDataUrl, 'data_url');
    const proofUrl = await getDownloadURL(proofSnapshot.ref);

    return { proofUrl, printUrl };
  } catch (error) {
    console.error("Error uploading customization proof:", error);
    throw new Error("Could not save your design. Please try again.");
  }
}
