"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createMotion,
  deleteMotion,
  updateMotion,
} from "@/lib/motions";
import {
  MOTION_DIFFICULTIES,
  MOTION_FORMATS,
  type MotionCatalogueItem,
  type MotionDifficulty,
  type MotionFormat,
  type MotionInput,
} from "@/lib/motion-types";

type ThemeOption = { id: string; name: string };
type TagOption = { id: string; name: string };

type MotionsManagementProps = {
  items: MotionCatalogueItem[];
  themes: ThemeOption[];
  tags: TagOption[];
  tournamentNames: string[];
  loadError?: string | null;
};

type PanelMode = "create" | "edit";

type FormState = {
  text: string;
  format: MotionFormat;
  themeId: string;
  difficulty: MotionDifficulty;
  year: string;
  tournament: string;
  tagIds: string[];
};

function emptyForm(themes: ThemeOption[]): FormState {
  return {
    text: "",
    format: "BP",
    themeId: themes[0]?.id ?? "",
    difficulty: "Open",
    year: String(new Date().getFullYear()),
    tournament: "",
    tagIds: [],
  };
}

export function MotionsManagement({
  items,
  themes,
  tags,
  tournamentNames,
  loadError = null,
}: MotionsManagementProps) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<PanelMode>("create");
  const [editing, setEditing] = useState<MotionCatalogueItem | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(themes));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags],
  );

  function openCreate() {
    setMode("create");
    setEditing(null);
    setForm(emptyForm(themes));
    setError(null);
    setPanelOpen(true);
  }

  function openEdit(item: MotionCatalogueItem) {
    setMode("edit");
    setEditing(item);
    setForm({
      text: item.text,
      format: item.format,
      themeId: item.themeId,
      difficulty: item.difficulty,
      year: String(item.year),
      tournament: item.tournament ?? "",
      tagIds: [...item.tagIds],
    });
    setError(null);
    setPanelOpen(true);
  }

  function closePanel() {
    if (pending) return;
    setPanelOpen(false);
    setError(null);
  }

  function toggleTag(tagId: string) {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId],
    }));
  }

  function toInput(): MotionInput | null {
    const year = Number(form.year);
    if (!form.text.trim()) {
      setError("Motion text is required.");
      return null;
    }
    if (!form.themeId) {
      setError("Theme is required.");
      return null;
    }
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setError("Year must be between 1900 and 2100.");
      return null;
    }

    return {
      text: form.text.trim(),
      format: form.format,
      themeId: form.themeId,
      difficulty: form.difficulty,
      year,
      tournament: form.tournament.trim() || null,
      tagIds: form.tagIds,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const input = toInput();
    if (!input) return;

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createMotion(input)
          : editing
            ? await updateMotion(editing.id, input)
            : { ok: false as const, error: "No motion selected." };

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPanelOpen(false);
      setEditing(null);
      setForm(emptyForm(themes));
      router.refresh();
    });
  }

  function handleDelete(item: MotionCatalogueItem) {
    const confirmed = window.confirm(
      `Delete this motion?\n\n${item.text.slice(0, 120)}`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteMotion(item.id);
      if (!result.ok) {
        setError(result.error);
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
              Motions
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Motion Bank catalogue · {items.length} total
            </p>
          </div>
          {!panelOpen ? (
            <button
              type="button"
              onClick={openCreate}
              disabled={themes.length === 0}
              className="rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              Add motion
            </button>
          ) : null}
        </div>

        {themes.length === 0 ? (
          <p className="mb-4 text-sm text-amber-700">
            Create at least one theme before adding motions.
          </p>
        ) : null}

        {loadError ? (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {loadError}
          </p>
        ) : null}

        <div className="min-w-0 overflow-x-auto border-t border-zinc-200">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
                <th className="py-3 pr-4 font-medium">Motion</th>
                <th className="py-3 pr-4 font-medium">Meta</th>
                <th className="py-3 pr-4 font-medium">Year</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-sm text-zinc-500">
                    No motions yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-zinc-900">{item.text}</p>
                      {item.tags.length > 0 ? (
                        <p className="mt-1 text-xs text-zinc-500">
                          {item.tags.join(" · ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-600">
                      <p>
                        {item.format} / {item.theme} / {item.difficulty}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        {item.tournament || "Practice set"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-zinc-600">
                      {item.year}
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
          panelOpen ? "w-full sm:w-[26rem] xl:w-[30rem]" : "w-0 border-l-0"
        }`}
        aria-hidden={!panelOpen}
      >
        <div
          className={`flex h-full min-h-0 w-full flex-col sm:w-[26rem] xl:w-[30rem] ${
            panelOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-200`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {mode === "create" ? "New motion" : "Edit motion"}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Theme and tags use the catalogue lookups
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
                Motion text
              </span>
              <textarea
                required
                rows={4}
                value={form.text}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    text: event.target.value,
                  }))
                }
                disabled={pending}
                className="w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                  Format
                </span>
                <select
                  value={form.format}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      format: event.target.value as MotionFormat,
                    }))
                  }
                  disabled={pending}
                  className={inputClass}
                >
                  {MOTION_FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                  Level
                </span>
                <select
                  value={form.difficulty}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      difficulty: event.target.value as MotionDifficulty,
                    }))
                  }
                  disabled={pending}
                  className={inputClass}
                >
                  {MOTION_DIFFICULTIES.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                Theme
              </span>
              <select
                required
                value={form.themeId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    themeId: event.target.value,
                  }))
                }
                disabled={pending}
                className={inputClass}
              >
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                  Year
                </span>
                <input
                  type="number"
                  required
                  min={1900}
                  max={2100}
                  value={form.year}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      year: event.target.value,
                    }))
                  }
                  disabled={pending}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                  Tournament
                </span>
                <input
                  type="text"
                  list="tournament-names"
                  value={form.tournament}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tournament: event.target.value,
                    }))
                  }
                  disabled={pending}
                  placeholder="Optional"
                  className={inputClass}
                />
                <datalist id="tournament-names">
                  {tournamentNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </label>
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-medium text-zinc-600">
                Tags
              </legend>
              {sortedTags.length === 0 ? (
                <p className="text-xs text-zinc-500">No tags yet.</p>
              ) : (
                <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                  {sortedTags.map((tag) => {
                    const active = form.tagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        disabled={pending}
                        className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>

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
                    ? "Create motion"
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

const inputClass =
  "w-full border-0 border-b border-zinc-200 bg-transparent px-0 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60";
