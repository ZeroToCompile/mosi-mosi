/**
 * Nest auth API helpers for server-side calls.
 * Prefer API_URL inside Docker (`http://api:3001`); fall back to public URL.
 */
export const AUTH_API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3011";

export function authUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${AUTH_API_BASE}/api/auth${normalized}`;
}
