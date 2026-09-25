"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdminUser } from "@/app/admin/users/actions";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  banned: boolean | null;
  createdAt: string;
};

type UsersManagementProps = {
  users: AdminUserRow[];
  total: number;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function UsersManagement({ users, total }: UsersManagementProps) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setError(null);
  }

  function openPanel() {
    resetForm();
    setPanelOpen(true);
  }

  function closePanel() {
    if (pending) return;
    setPanelOpen(false);
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createAdminUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      resetForm();
      setPanelOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col overflow-auto pl-6 pr-6 pt-6 sm:pl-8 lg:pl-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              Users
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{total} total</p>
          </div>
          {!panelOpen ? (
            <button
              type="button"
              onClick={openPanel}
              className="rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Add user
            </button>
          ) : null}
        </div>

        <div className="min-w-0 overflow-x-auto border-t border-zinc-200">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Role</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-sm text-zinc-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/80">
                    <td className="py-3 pr-4 font-medium text-zinc-900">
                      {user.name || "—"}
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">{user.email}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {user.banned ? (
                        <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 whitespace-nowrap text-zinc-500">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside
        className={`flex shrink-0 flex-col overflow-hidden border-l border-zinc-200 bg-zinc-50 transition-[width] duration-300 ease-out ${
          panelOpen ? "w-full sm:w-[22rem] xl:w-96" : "w-0 border-l-0"
        }`}
        aria-hidden={!panelOpen}
      >
        <div
          className={`flex h-full min-h-0 w-full flex-col sm:w-[22rem] xl:w-96 ${
            panelOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-200`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">New user</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Email and password account
              </p>
            </div>
            <button
              type="button"
              onClick={closePanel}
              disabled={pending}
              className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            method="post"
            action="#"
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5"
            autoComplete="off"
          >
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                Name
              </span>
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={pending}
                className="w-full border-0 border-b border-zinc-200 bg-transparent px-0 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
                className="w-full border-0 border-b border-zinc-200 bg-transparent px-0 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                Password
              </span>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                className="w-full border-0 border-b border-zinc-200 bg-transparent px-0 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                Role
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "user" | "admin")}
                disabled={pending}
                className="w-full border-0 border-b border-zinc-200 bg-transparent px-0 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="mt-auto flex flex-col gap-2 border-t border-zinc-200 pt-4">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {pending ? "Creating…" : "Create user"}
              </button>
              <button
                type="button"
                onClick={closePanel}
                disabled={pending}
                className="w-full rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
