import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts any object that may contain Firestore Timestamps into a plain object
 * with ISO date strings. This is necessary to pass data from the client to
 * server components/actions without causing serialization errors.
 * @param obj The object to convert.
 * @returns A new object with Timestamps converted to strings.
 */
export function makePlain<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Firestore Timestamp
  if (obj && typeof (obj as any).toDate === 'function') {
    return (obj as any).toDate().toISOString() as any;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => makePlain(item)) as any;
  }
  
  // Handle objects
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = makePlain((obj as any)[key]);
    }
  }

  return newObj as T;
}

    