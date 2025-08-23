import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple crypto utilities for demo purposes
export const CryptoUtils = {
  encrypt(text: string): string {
    try {
      const data = new TextEncoder().encode(text)
      const b64 = btoa(String.fromCharCode(...data))
      return b64
    } catch {
      return text
    }
  },
  decrypt(text: string): string {
    try {
      const bin = atob(text)
      const bytes = new Uint8Array([...bin].map((c) => c.charCodeAt(0)))
      return new TextDecoder().decode(bytes)
    } catch {
      return text
    }
  },
}