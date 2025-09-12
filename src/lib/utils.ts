
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively converts any object that may contain non-plain objects (like Firestore Timestamps)
 * into a plain, serializable object.
 * @param obj The object to convert.
 * @returns A new object that is guaranteed to be plain and serializable.
 */
export function makePlain<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Handle Firestore Timestamps
    if (typeof (obj as any).toDate === 'function') {
        return (obj as any).toDate().toISOString();
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => makePlain(item)) as any;
    }
    
    // Handle objects
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = makePlain(obj[key]);
        }
    }
    return newObj as T;
}
