const SMALL_NAME_WORDS = new Set(["a", "as", "da", "das", "de", "do", "dos", "e"]);

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "");
}

export function sanitizeText(value: unknown, maxLength = 240) {
  if (typeof value !== "string") return "";
  return normalizeWhitespace(stripHtml(value)).slice(0, maxLength).trim();
}

export function sanitizeOptionalText(value: unknown, maxLength = 240) {
  const text = sanitizeText(value, maxLength);
  return text || undefined;
}

export function normalizeName(value: unknown, maxLength = 120) {
  const safe = sanitizeText(value, maxLength).toLocaleLowerCase("pt-BR");
  if (!safe) return "";

  return safe
    .split(" ")
    .map((word, index) => {
      if (index > 0 && SMALL_NAME_WORDS.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}

export function normalizeEmail(value: unknown, maxLength = 160) {
  return sanitizeText(value, maxLength).toLocaleLowerCase("pt-BR");
}

export function normalizeUpperCode(value: unknown, maxLength = 80) {
  return sanitizeText(value, maxLength).toLocaleUpperCase("pt-BR");
}

export function normalizePhoneDigits(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

export function normalizePhone(value: unknown) {
  const digits = normalizePhoneDigits(value).slice(0, 11);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return sanitizeText(value, 40);
}

export function normalizeZipCode(value: unknown) {
  const digits = typeof value === "string" ? value.replace(/\D/g, "").slice(0, 8) : "";
  if (digits.length === 8) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return sanitizeText(value, 20);
}

export function readClampedNumber(value: unknown, fallback = 0, min = 0, max = 999) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;

  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(numeric)));
}

export function readClampedDecimal(value: unknown, fallback = 0, min = 0, max = 999999999) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;

  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}
