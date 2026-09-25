"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { authUrl } from "@/lib/auth-api";
import { hasAdminRole } from "@/lib/admin";
import { getSession } from "@/lib/session";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
};

export type CreateUserResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createAdminUser(
  input: CreateUserInput,
): Promise<CreateUserResult> {
  const session = await getSession();

  if (!session) {
    return { ok: false, error: "You must be signed in." };
  }

  if (!hasAdminRole(session.user.role)) {
    return { ok: false, error: "Only admins can create users." };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const role = input.role === "admin" ? "admin" : "user";

  if (!name || !email || !password) {
    return { ok: false, error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  try {
    const cookie = (await headers()).get("cookie") ?? "";
    const response = await fetch(authUrl("/admin/create-user"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      const message = payload?.message || "Could not create user.";

      if (/already|exists|unique/i.test(message)) {
        return { ok: false, error: "A user with that email already exists." };
      }

      return { ok: false, error: message };
    }

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create user.";
    return { ok: false, error: message || "Could not create user." };
  }
}
