"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiUrl } from "@/lib/auth-api";
import { hasAdminRole } from "@/lib/admin";
import { getSession } from "@/lib/session";
import type {
  Tournament,
  TournamentActionResult,
  TournamentInput,
} from "@/lib/tournament-types";

const PAGE_PATH = "/admin/content-administration/tournaments";

async function requireAdmin(): Promise<TournamentActionResult | null> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "You must be signed in." };
  }
  if (!hasAdminRole(session.user.role)) {
    return { ok: false, error: "Only admins can manage tournaments." };
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

function normalizeTournament(raw: Tournament): Tournament {
  return {
    ...raw,
    dateStart: String(raw.dateStart).slice(0, 10),
    dateEnd: String(raw.dateEnd).slice(0, 10),
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt),
  };
}

export async function listTournaments(): Promise<{
  items: Tournament[];
  error: string | null;
}> {
  const denied = await requireAdmin();
  if (denied) {
    return { items: [], error: denied.error };
  }

  try {
    const response = await apiFetch("/tournaments");
    if (!response.ok) {
      return {
        items: [],
        error: await readError(response, "Could not load tournaments."),
      };
    }

    const items = (await response.json()) as Tournament[];
    return { items: items.map(normalizeTournament), error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load tournaments.";
    return { items: [], error: message };
  }
}

export async function createTournament(
  input: TournamentInput,
): Promise<TournamentActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const response = await apiFetch("/tournaments", {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, "Could not create tournament."),
      };
    }

    const item = normalizeTournament((await response.json()) as Tournament);
    revalidatePath(PAGE_PATH);
    return { ok: true, item };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create tournament.";
    return { ok: false, error: message };
  }
}

export async function updateTournament(
  id: string,
  input: TournamentInput,
): Promise<TournamentActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const response = await apiFetch(`/tournaments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, "Could not update tournament."),
      };
    }

    const item = normalizeTournament((await response.json()) as Tournament);
    revalidatePath(PAGE_PATH);
    return { ok: true, item };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update tournament.";
    return { ok: false, error: message };
  }
}

export async function deleteTournament(
  id: string,
): Promise<TournamentActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const response = await apiFetch(`/tournaments/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readError(response, "Could not delete tournament."),
      };
    }

    revalidatePath(PAGE_PATH);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete tournament.";
    return { ok: false, error: message };
  }
}
