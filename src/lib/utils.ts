import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDateBR(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date)
  } catch (error) {
    return dateString
  }
}

export function capitalizeName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length > 2 || word.toLowerCase() === "mcc") {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word; // keeps 'da', 'de', 'do' lowercase
    })
    .join(" ");
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
  }
  return phone; // Return original if not 11 digits (e.g., international)
}

export function formatZipCode(zip: string): string {
  const cleaned = zip.replace(/\D/g, "");
  if (cleaned.length === 8) {
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 8)}`;
  }
  return zip;
}

export function calculateAge(birthDateString: string): number | null {
  if (!birthDateString) return null;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
