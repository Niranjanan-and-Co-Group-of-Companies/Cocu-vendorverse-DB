
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
  
  // Create a deep copy to avoid modifying the original object.
  let newObj = JSON.parse(JSON.stringify(obj));

  // Recursive function to traverse and convert timestamps.
  function traverse(currentObj: any) {
    if (currentObj === null || typeof currentObj !== 'object') {
      return;
    }
    
    for (const key in currentObj) {
      if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
        const value = currentObj[key];
        // Check for Firestore Timestamp-like structure.
        if (value && typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined && typeof value.toDate === 'function') {
           currentObj[key] = value.toDate().toISOString();
        } else if (value && typeof value === 'object') {
          // If it's another object or an array, recurse.
          traverse(value);
        }
      }
    }
  }

  traverse(newObj);
  return newObj;
}
