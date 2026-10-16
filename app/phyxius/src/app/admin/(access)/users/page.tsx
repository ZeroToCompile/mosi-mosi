import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  UsersManagement,
  type AdminUserRow,
} from "@/components/admin/UsersManagement";
import { authUrl } from "@/lib/auth-api";

export const metadata: Metadata = {
  title: "Users — Admin — MosiMosi",
};

type ListUsersResponse = {
  users?: Array<{
    id: string;
    name: string | null;
    email: string;
    role?: string | null;
    banned?: boolean | null;
    createdAt: string | Date;
  }>;
  total?: number;
};

export default async function AdminUsersPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  let users: AdminUserRow[] = [];
  let total = 0;

  try {
    const params = new URLSearchParams({
      limit: "100",
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    const response = await fetch(
      `${authUrl("/admin/list-users")}?${params.toString()}`,
      {
        method: "GET",
        headers: { cookie },
        cache: "no-store",
      },
    );

    if (response.ok) {
      const result = (await response.json()) as ListUsersResponse;
      users = (result.users ?? []).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ?? null,
        banned: user.banned ?? null,
        createdAt:
          user.createdAt instanceof Date
            ? user.createdAt.toISOString()
            : String(user.createdAt),
      }));
      total = result.total ?? users.length;
    }
  } catch {
    // Leave empty list; layout already gates on admin session.
  }

  return <UsersManagement users={users} total={total} />;
}
