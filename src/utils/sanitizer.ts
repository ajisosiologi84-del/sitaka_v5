/**
 * Utility for input sanitization and XSS protection
 */

export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript pseudo protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers like onload=, onerror=
    .trim();
}

export function sanitizeNis(nis: string | undefined | null): string {
  if (!nis) return '';
  // Only allow alphanumeric, numbers, dashes, and dots for NIS/NISN
  return String(nis).replace(/[^a-zA-Z0-9.-]/g, '').trim();
}

export function formatNisn(nisn: string | number | undefined | null): string {
  if (!nisn) return '';
  let cleaned = String(nisn).replace(/^'/, '').trim();
  // Indonesian NISN is a 10-digit number. If leading zero(s) were truncated (e.g. 86695501), pad to 10 digits
  if (cleaned && /^\d+$/.test(cleaned) && cleaned.length < 10) {
    cleaned = cleaned.padStart(10, '0');
  }
  return cleaned;
}

export function isValidNisFormat(nis: string): boolean {
  if (!nis || nis.trim().length === 0) return false;
  // NIS usually 3-15 characters alphanumeric
  return /^[a-zA-Z0-9.-]{3,20}$/.test(nis.trim());
}

export function generateRandomStudentPassword(length = 6): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
