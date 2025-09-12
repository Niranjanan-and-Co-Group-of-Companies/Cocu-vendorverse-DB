
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
export function makePlain<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Firestore Timestamp by checking for toDate method
  if (typeof (obj as any).toDate === 'function') {
    return (obj as any).toDate().toISOString();
  }

  // Handle Arrays by mapping over them and calling makePlain recursively
  if (Array.isArray(obj)) {
    return obj.map(item => makePlain(item));
  }
  
  // Handle Objects by iterating over their properties and calling makePlain recursively
  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = makePlain((obj as any)[key]);
      }
    }
    return newObj;
  }

  // Return primitive values as is
  return obj;
}
