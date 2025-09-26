
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function makePlain(obj: any) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  // Convert Firestore Timestamps to ISO strings
  if (typeof obj.toDate === 'function') {
    return obj.toDate().toISOString();
  }
  // If it's an array, map over it
  if (Array.isArray(obj)) {
    return obj.map(makePlain);
  }
  // If it's an object, recursively process its properties
  if (typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key] = makePlain(value);
      return acc;
    }, {} as {[key: string]: any});
  }
  // Return primitives directly
  return obj;
}
