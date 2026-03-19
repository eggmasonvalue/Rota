import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a UUID v4 string.
 * Uses cryptographically secure random number generation when available.
 */
export function generateUUID(): string {
  // 1. Try modern crypto.randomUUID()
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // 2. Fallback to crypto.getRandomValues()
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    // We use unknown cast before string cast to avoid linter complaints and then replace.
    const uuidTemplate = "10000000-1000-4000-8000-100000000000";
    return uuidTemplate.replace(/[018]/g, (cStr: string) => {
      const c = Number(cStr);
      return (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
    });
  }

  // 3. Last resort: Math.random() (non-cryptographically secure)
  // This ensures functionality in extremely restricted or legacy environments.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
