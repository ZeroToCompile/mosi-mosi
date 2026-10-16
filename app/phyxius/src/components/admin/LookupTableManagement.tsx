"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LookupItem } from "@/lib/content-lookups";
import {
  createLookup,
  deleteLookup,
  updateLookup,
} from "@/lib/content-lookups";

type LookupKind = "themes" | "tags";

type LookupTableManagementProps = {
  kind: LookupKind;
  title: string;
  description: string;
  singular: string;
  items: LookupItem[];
  loadError?: string | null;
  deleteBlockedWhenUsed?: boolean;
};

type PanelMode = "create" | "edit";

export function LookupTableManagement({
  kind,
  title,
  description,
  singular,
  items,
  loadError = null,
  deleteBlockedWhenUsed = false,
}: LookupTableManagementProps) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<PanelMode>("create");
  const [editing, setEditing] = useState<LookupItem | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setMode("create");
    setEditing(null);
    setName("");
    setError(null);
    setPanelOpen(true);
  }

  function openEdit(item: LookupItem) {
    setMode("edit");
    setEditing(item);
    setName(item.name);
    setError(null);
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
      const result =
        mode === "create"
          ? await createLookup(kind, name)
          : editing
            ? await updateLookup(kind, editing.id, name)
            : { ok: false as const, error: `No ${singular} selected.` };

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPanelOpen(false);
      setEditing(null);
      setName("");
      router.refresh();
    });
  }

  function handleDelete(item: LookupItem) {
    if (deleteBlockedWhenUsed && item.usageCount > 0) {
      setError(
        `“${item.name}” is used by ${item.usageCount} motion${
          item.usageCount === 1 ? "" : "s"
        } and cannot be deleted.`,
      );
      setPanelOpen(true);
      setMode("edit");
      setEditing(item);
      setName(item.name);
      return;
    }

    const confirmed = window.confirm(
      item.usageCount > 0
        ? `Delete “${item.name}”? It is linked to ${item.usageCount} motion${
            item.usageCount === 1 ? "" : "s"
          }; those links will be removed.`
        : `Delete “${item.name}”?`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteLookup(kind, item.id);
      if (!result.ok) {
        setError(result.error);
        setPanelOpen(true);
        setMode("edit");
        setEditing(item);
        setName(item.name);
        return;
      }

      if (editing?.id === item.id) {
        setPanelOpen(false);
        setEditing(null);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col overflow-auto pl-6 pr-6 pt-6 sm:pl-8 lg:pl-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              {title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {description} · {items.length} total
            </p>
          </div>
          {!panelOpen ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Add {singular}
            </button>
          ) : null}
        </div>

        {loadError ? (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {loadError}
          </p>
        ) : null}

        <div className="min-w-0 overflow-x-auto border-t border-zinc-200">
          <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Used by</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-sm text-zinc-500">
                    No {title.toLowerCase()} yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80">
                    <td className="py-3 pr-4 font-medium text-zinc-900">
                      {item.name}
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">
                      {item.usageCount} motion
                      {item.usageCount === 1 ? "" : "s"}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          disabled={pending}
                          className="rounded-md px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={pending}
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
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
              <h2 className="text-base font-semibold text-zinc-900">
                {mode === "create" ? `New ${singular}` : `Edit ${singular}`}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {mode === "create"
                  ? `Add a ${singular} to the catalogue`
                  : "Rename this entry"}
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
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={pending}
                className="w-full border-0 border-b border-zinc-200 bg-transparent px-0 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60"
              />
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
                {pending
                  ? mode === "create"
                    ? "Creating…"
                    : "Saving…"
                  : mode === "create"
                    ? `Create ${singular}`
                    : "Save changes"}
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
