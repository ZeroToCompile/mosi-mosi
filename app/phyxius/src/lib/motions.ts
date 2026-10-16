"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiUrl } from "@/lib/auth-api";
import { hasAdminRole } from "@/lib/admin";
import { getSession } from "@/lib/session";
import type {
  MotionActionResult,
  MotionCatalogueItem,
  MotionInput,
} from "@/lib/motion-types";

const PAGE_PATH = "/admin/content-administration/motions";
const PUBLIC_PATH = "/motions";

async function requireAdmin(): Promise<MotionActionResult | null> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "You must be signed in." };
  }
  if (!hasAdminRole(session.user.role)) {
    return { ok: false, error: "Only admins can manage motions." };
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

function normalizeItem(raw: MotionCatalogueItem): MotionCatalogueItem {
  return {
    ...raw,
    year: Number(raw.year),
    tournament: raw.tournament ?? null,
    tags: raw.tags ?? [],
    tagIds: (raw.tagIds ?? []).map(String),
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt),
  };
}

export async function listMotions(): Promise<{
  items: MotionCatalogueItem[];
  error: string | null;
}> {
  try {
    const response = await apiFetch("/motions");
    if (!response.ok) {
      return {
        items: [],
        error: await readError(response, "Could not load motions."),
      };
    }

    const items = (await response.json()) as MotionCatalogueItem[];
    return { items: items.map(normalizeItem), error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load motions.";
    return { items: [], error: message };
  }
}

export async function createMotion(
  input: MotionInput,
): Promise<MotionActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const response = await apiFetch("/motions", {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, "Could not create motion."),
      };
    }

    const item = normalizeItem((await response.json()) as MotionCatalogueItem);
    revalidatePath(PAGE_PATH);
    revalidatePath(PUBLIC_PATH);
    return { ok: true, item };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create motion.";
    return { ok: false, error: message };
  }
}

export async function updateMotion(
  id: string,
  input: MotionInput,
): Promise<MotionActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const response = await apiFetch(`/motions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, "Could not update motion."),
      };
    }

    const item = normalizeItem((await response.json()) as MotionCatalogueItem);
    revalidatePath(PAGE_PATH);
    revalidatePath(PUBLIC_PATH);
    return { ok: true, item };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update motion.";
    return { ok: false, error: message };
  }
}

export async function deleteMotion(id: string): Promise<MotionActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const response = await apiFetch(`/motions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, "Could not delete motion."),
      };
    }

    revalidatePath(PAGE_PATH);
    revalidatePath(PUBLIC_PATH);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete motion.";
    return { ok: false, error: message };
  }
}
