import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Inserisci un indirizzo email valido" })
  .max(255, { message: "L'email deve essere meno di 255 caratteri" });

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, { message: "La password deve essere almeno 8 caratteri" })
  .max(128, { message: "La password deve essere meno di 128 caratteri" })
  .regex(/[A-Z]/, { message: "Deve contenere almeno una lettera maiuscola" })
  .regex(/[a-z]/, { message: "Deve contenere almeno una lettera minuscola" })
  .regex(/[0-9]/, { message: "Deve contenere almeno un numero" });

// Name validation schema
export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Il nome deve essere almeno 2 caratteri" })
  .max(100, { message: "Il nome deve essere meno di 100 caratteri" })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Il nome contiene caratteri non validi" });

// Phone validation schema
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{8,20}$/, { message: "Inserisci un numero di telefono valido" });

// Review validation schema
export const reviewSchema = z
  .string()
  .trim()
  .min(10, { message: "La recensione deve essere almeno 10 caratteri" })
  .max(1000, { message: "La recensione deve essere meno di 1000 caratteri" });

// Guest count validation schema
export const guestCountSchema = z
  .number()
  .int()
  .min(1, { message: "Almeno 1 commensale" })
  .max(20, { message: "Massimo 20 commensali" });

// Redirect URL validation
const ALLOWED_REDIRECT_PATTERNS = [
  /^\/$/,
  /^\/restaurant\/[0-9]+/,
  /^\/profile$/,
  /^\/business$/,
  /^\/auth$/,
];

export function validateRedirectUrl(url: string): boolean {
  // Check if it starts with / and doesn't contain protocol
  if (!url.startsWith('/') || url.includes('://')) {
    return false;
  }
  
  // Check against allowed patterns
  return ALLOWED_REDIRECT_PATTERNS.some(pattern => pattern.test(url));
}

// Safe redirect function
export function getSafeRedirectUrl(url: string | null): string {
  if (!url || !validateRedirectUrl(url)) {
    return '/';
  }
  return url;
}
