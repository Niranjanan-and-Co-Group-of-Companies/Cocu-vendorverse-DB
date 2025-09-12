

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A robust and recursive function to convert any object that may contain non-plain objects 
 * (like Firestore Timestamps) into a plain, serializable object.
 * @param obj The object to convert.
 * @returns A new object that is guaranteed to be plain and serializable.
 */
export function makePlain<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
