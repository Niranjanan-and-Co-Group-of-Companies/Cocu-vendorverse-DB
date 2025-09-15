
'use server';

import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import type { CustomizationSide } from './products';

export interface CustomizationProof {
  side: CustomizationSide;
  proofUrl: string; // URL to a low-res JPG/PNG for display
  printUrl: string; // URL to a high-res SVG/PDF for printing
}

/**
 * Saves a customization data URL to Firebase Storage.
 * @param productId - The ID of the product being customized.
 * @param side - The product side being saved.
 * @param dataUrl - The base64 data URL of the canvas image.
 * @returns The public download URL of the uploaded image.
 */
export async function saveCustomizationProof(productId: string, side: CustomizationSide, dataUrl: string): Promise<string> {
  // In a real app, we'd distinguish between proof and print files,
  // but for now, we'll upload the same file for both.
  const path = `customizations/${productId}/proof_${side}_${Date.now()}.png`;
  const storageRef = ref(storage, path);

  try {
    // Firebase Storage SDK's `uploadString` handles data URLs correctly.
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading customization proof:", error);
    throw new Error("Could not save your design. Please try again.");
  }
}
