"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiUrl } from "@/lib/auth-api";
import { hasAdminRole } from "@/lib/admin";
import { getSession } from "@/lib/session";

export type LookupItem = {
  id: string;
  name: string;
  usageCount: number;
};

export type LookupActionResult =
  | { ok: true; item?: LookupItem }
  | { ok: false; error: string };

type LookupKind = "themes" | "tags";

const PATHS: Record<LookupKind, string> = {
  themes: "/admin/content-administration/themes",
  tags: "/admin/content-administration/tags",
};

async function requireAdmin(): Promise<LookupActionResult | null> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "You must be signed in." };
  }
  if (!hasAdminRole(session.user.role)) {
    return { ok: false, error: "Only admins can manage catalogue lookups." };
  }
  return null;
}

async function apiFetch(path: string, init?: RequestInit) {
  const cookie = (await headers()).get("cookie") ?? "";
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      cookie,
      ...(init?.body ? { "content-type": "application/json" } : {}),
    },
    cache: "no-store",
  });
}

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  const message = payload?.message;
  if (Array.isArray(message)) {
    return message.join(" ") || fallback;
  }
  return message || fallback;
}

export async function listLookups(
  kind: LookupKind,
): Promise<{ items: LookupItem[]; error: string | null }> {
  const denied = await requireAdmin();
  if (denied) {
    return { items: [], error: denied.error };
  }

  try {
    const response = await apiFetch(`/motions/${kind}`);
    if (!response.ok) {
      return {
        items: [],
        error: await readError(response, `Could not load ${kind}.`),
      };
    }

    const items = (await response.json()) as LookupItem[];
    return { items, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `Could not load ${kind}.`;
    return { items: [], error: message };
  }
}

export async function createLookup(
  kind: LookupKind,
  name: string,
): Promise<LookupActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, error: "Name is required." };
  }

  try {
    const response = await apiFetch(`/motions/${kind}`, {
      method: "POST",
      body: JSON.stringify({ name: trimmed }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, `Could not create ${kind.slice(0, -1)}.`),
      };
    }

    const item = (await response.json()) as LookupItem;
    revalidatePath(PATHS[kind]);
    return { ok: true, item };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : `Could not create ${kind.slice(0, -1)}.`;
    return { ok: false, error: message };
  }
}

export async function updateLookup(
  kind: LookupKind,
  id: string,
  name: string,
): Promise<LookupActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, error: "Name is required." };
  }

  try {
    const response = await apiFetch(`/motions/${kind}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: trimmed }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, `Could not update ${kind.slice(0, -1)}.`),
      };
    }

    const item = (await response.json()) as LookupItem;
    revalidatePath(PATHS[kind]);
    return { ok: true, item };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : `Could not update ${kind.slice(0, -1)}.`;
    return { ok: false, error: message };
  }
}

export async function deleteLookup(
  kind: LookupKind,
  id: string,
): Promise<LookupActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const response = await apiFetch(`/motions/${kind}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, `Could not delete ${kind.slice(0, -1)}.`),
      };
    }

    revalidatePath(PATHS[kind]);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : `Could not delete ${kind.slice(0, -1)}.`;
    return { ok: false, error: message };
  }
}
