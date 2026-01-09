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
  .regex(/[0-9]/, { message: "Deve contenere almeno un numero" })
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { message: "Deve contenere almeno un carattere speciale (!@#$%^&*...)" });

// Password strength checker for UI feedback
export const checkPasswordStrength = (password: string): {
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
} => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  
  return {
    isValid: Object.values(checks).every(Boolean),
    checks,
  };
};

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

// Italian phone validation schema (more strict)
export const italianPhoneSchema = z
  .string()
  .trim()
  .refine((val) => {
    const cleanPhone = val.replace(/[\s\-\(\)]/g, '');
    const patterns = [
      /^\+39\d{9,10}$/,
      /^0039\d{9,10}$/,
      /^0\d{9,10}$/,
      /^3\d{8,9}$/,
    ];
    return patterns.some(pattern => pattern.test(cleanPhone));
  }, { message: "Inserisci un numero di telefono italiano valido (es: +39 333 1234567)" });

// Italian VAT number validation schema
export const italianVATSchema = z
  .string()
  .trim()
  .refine((val) => {
    const cleanVat = val.replace(/\s/g, '').toUpperCase();
    const vatNumber = cleanVat.startsWith('IT') ? cleanVat.slice(2) : cleanVat;
    
    if (!/^\d{11}$/.test(vatNumber)) {
      return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const digit = parseInt(vatNumber[i], 10);
      if (i % 2 === 0) {
        sum += digit;
      } else {
        const doubled = digit * 2;
        sum += doubled > 9 ? doubled - 9 : doubled;
      }
    }
    
    return sum % 10 === 0;
  }, { message: "Inserisci una Partita IVA italiana valida (11 cifre)" });

// Italian postal code validation schema
export const italianPostalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, { message: "Il CAP deve essere di 5 cifre" })
  .refine((val) => {
    const numCode = parseInt(val, 10);
    return numCode >= 10 && numCode <= 98168;
  }, { message: "Inserisci un CAP italiano valido" });

// Street address validation
export const streetAddressSchema = z
  .string()
  .trim()
  .min(5, { message: "L'indirizzo deve essere almeno 5 caratteri" })
  .max(200, { message: "L'indirizzo deve essere meno di 200 caratteri" })
  .regex(/^[a-zA-ZÀ-ÿ0-9\s,.'°\/-]+$/, { message: "L'indirizzo contiene caratteri non validi" });

// Business name validation
export const businessNameSchema = z
  .string()
  .trim()
  .min(2, { message: "Il nome dell'attività deve essere almeno 2 caratteri" })
  .max(150, { message: "Il nome dell'attività deve essere meno di 150 caratteri" });

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
