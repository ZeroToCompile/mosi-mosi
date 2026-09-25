import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/** Nest Better Auth base (browser-facing). */
export const AUTH_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export const authClient = createAuthClient({
  baseURL: AUTH_API_BASE,
  plugins: [adminClient()],
});
