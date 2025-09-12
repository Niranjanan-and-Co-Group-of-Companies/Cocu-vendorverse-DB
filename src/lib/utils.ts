
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively converts any object that may contain Firestore Timestamps or other
 * non-plain objects into a plain, serializable object.
 * @param obj The object to convert.
 * @returns A new object that is safe to pass to Server Actions.
 */
export function makePlain(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Firestore Timestamp
  if (typeof obj.toDate === 'function') {
    return obj.toDate().toISOString();
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => makePlain(item));
  }
  
  // Handle Objects
  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = makePlain(obj[key]);
      }
    }
    return newObj;
  }

  // Return primitive values as is
  return obj;
}
