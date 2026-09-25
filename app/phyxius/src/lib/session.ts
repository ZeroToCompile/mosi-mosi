import { headers } from "next/headers";
import { authUrl } from "@/lib/auth-api";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role?: string | null;
};

export type Session = {
  user: SessionUser;
  session?: {
    id: string;
    token?: string;
    expiresAt?: string | Date;
  };
} | null;

type GetSessionResponse = {
  user?: SessionUser | null;
  session?: {
    id: string;
    token?: string;
    expiresAt?: string | Date;
  };
} | null;

export async function getSession(): Promise<Session> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? "";

  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(authUrl("/get-session"), {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GetSessionResponse;

    if (!data?.user) {
      return null;
    }

    return {
      user: data.user,
      session: data.session,
    };
  } catch {
    return null;
  }
}
