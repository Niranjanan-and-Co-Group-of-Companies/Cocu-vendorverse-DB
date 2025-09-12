
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively converts any object that may contain non-plain objects (like Firestore Timestamps)
 * into a plain, serializable object by using JSON stringification and parsing.
 * This is a robust way to ensure data is safe to pass from Server to Client Components.
 * @param obj The object to convert.
 * @returns A new object that is guaranteed to be plain and serializable.
 */
export function makePlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
