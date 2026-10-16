/**
 * Nest API helpers for server-side calls.
 * Prefer API_URL inside Docker (`http://api:3001` / `http://api-dev:3001`);
 * fall back to the browser-facing public URL.
 */
export const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3011";

/** @deprecated Prefer {@link API_BASE}. Kept for existing imports. */
export const AUTH_API_BASE = API_BASE;

export function apiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export function authUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}/api/auth${normalized}`;
}
