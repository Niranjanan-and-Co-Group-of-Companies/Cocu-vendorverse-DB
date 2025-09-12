
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively converts any object that may contain Firestore Timestamps or other
 * non-plain objects into a plain, serializable object. It checks for the existence
 * of a `toDate` method to identify Timestamp-like objects.
 * @param obj The object to convert.
 * @returns A new object that is safe to pass from Server to Client Components.
 */
export function makePlain(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Robustly identify Firestore Timestamps (or similar objects) and convert to ISO string.
  if (typeof obj.toDate === 'function') {
    return obj.toDate().toISOString();
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle Arrays by mapping over them and calling makePlain recursively
  if (Array.isArray(obj)) {
    return obj.map(item => makePlain(item));
  }
  
  // Handle Objects by iterating over their properties recursively
  // This check ensures we are only processing plain objects.
  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = makePlain(obj[key]);
      }
    }
    return newObj;
  }

  // Return primitive values (string, number, boolean, etc.) as is
  return obj;
}
