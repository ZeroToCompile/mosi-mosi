"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTournament,
  deleteTournament,
  updateTournament,
} from "@/lib/tournaments";
import {
  TOURNAMENT_FORMATS,
  type Tournament,
  type TournamentFormat,
  type TournamentInput,
} from "@/lib/tournament-types";

type TournamentsManagementProps = {
  items: Tournament[];
  loadError?: string | null;
};

type PanelMode = "create" | "edit";

type FormState = {
  name: string;
  dateStart: string;
  dateEnd: string;
  format: TournamentFormat;
  capList: string;
  tabberList: string;
  debaterList: string;
  organizer: string;
  institution: string;
};

const emptyForm = (): FormState => ({
  name: "",
  dateStart: "",
  dateEnd: "",
  format: "BP",
  capList: "",
  tabberList: "",
  debaterList: "",
  organizer: "",
  institution: "",
});

function linesToList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(value: string[]): string {
  return value.join("\n");
}

function toInput(form: FormState): TournamentInput {
  return {
    name: form.name.trim(),
    dateStart: form.dateStart,
    dateEnd: form.dateEnd,
    format: form.format,
    capList: linesToList(form.capList),
    tabberList: linesToList(form.tabberList),
    debaterList: linesToList(form.debaterList),
    organizer: form.organizer.trim(),
    institution: form.institution.trim(),
  };
}

function formatRange(start: string, end: string) {
  if (start === end) return start;
  return `${start} → ${end}`;
}

export function TournamentsManagement({
  items,
  loadError = null,
}: TournamentsManagementProps) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<PanelMode>("create");
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setMode("create");
    setEditing(null);
    setForm(emptyForm());
    setError(null);
    setPanelOpen(true);
  }

  function openEdit(item: Tournament) {
    setMode("edit");
    setEditing(item);
    setForm({
      name: item.name,
      dateStart: item.dateStart,
      dateEnd: item.dateEnd,
      format: item.format,
      capList: listToLines(item.capList),
      tabberList: listToLines(item.tabberList),
      debaterList: listToLines(item.debaterList),
      organizer: item.organizer,
      institution: item.institution,
    });
    setError(null);
    setPanelOpen(true);
  }

  function closePanel() {
    if (pending) return;
    setPanelOpen(false);
    setError(null);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const input = toInput(form);
    if (!input.name || !input.organizer || !input.institution) {
      setError("Name, organizer, and institution are required.");
      return;
    }
    if (!input.dateStart || !input.dateEnd) {
      setError("Start and end dates are required.");
      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createTournament(input)
          : editing
            ? await updateTournament(editing.id, input)
            : { ok: false as const, error: "No tournament selected." };

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPanelOpen(false);
      setEditing(null);
      setForm(emptyForm());
      router.refresh();
    });
  }

  function handleDelete(item: Tournament) {
    const confirmed = window.confirm(`Delete “${item.name}”?`);
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteTournament(item.id);
      if (!result.ok) {
        setError(result.error);
        setPanelOpen(true);
        setMode("edit");
        setEditing(item);
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
              Tournaments
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Registry of debate events · {items.length} total
            </p>
          </div>
          {!panelOpen ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Add tournament
            </button>
          ) : null}
        </div>

        {loadError ? (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {loadError}
          </p>
        ) : null}

        <div className="min-w-0 overflow-x-auto border-t border-zinc-200">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Dates</th>
                <th className="py-3 pr-4 font-medium">Format</th>
                <th className="py-3 pr-4 font-medium">Institution</th>
                <th className="py-3 pr-4 font-medium">Staff</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-sm text-zinc-500">
                    No tournaments yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-zinc-900">{item.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {item.organizer}
                      </p>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-zinc-600">
                      {formatRange(item.dateStart, item.dateEnd)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                        {item.format}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">
                      {item.institution}
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">
                      CAP {item.capList.length} · Tab{" "}
                      {item.tabberList.length} · Deb{" "}
                      {item.debaterList.length}
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
          panelOpen ? "w-full sm:w-[24rem] xl:w-[28rem]" : "w-0 border-l-0"
        }`}
        aria-hidden={!panelOpen}
      >
        <div
          className={`flex h-full min-h-0 w-full flex-col sm:w-[24rem] xl:w-[28rem] ${
            panelOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-200`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {mode === "create" ? "New tournament" : "Edit tournament"}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Lists accept one name per line
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
            <Field label="Name">
              <input
                type="text"
                required
                maxLength={200}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                disabled={pending}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input
                  type="date"
                  required
                  value={form.dateStart}
                  onChange={(event) =>
                    updateField("dateStart", event.target.value)
                  }
                  disabled={pending}
                  className={inputClass}
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  required
                  value={form.dateEnd}
                  onChange={(event) =>
                    updateField("dateEnd", event.target.value)
                  }
                  disabled={pending}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Format">
              <select
                value={form.format}
                onChange={(event) =>
                  updateField(
                    "format",
                    event.target.value as TournamentFormat,
                  )
                }
                disabled={pending}
                className={inputClass}
              >
                {TOURNAMENT_FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Organizer">
              <input
                type="text"
                required
                maxLength={200}
                value={form.organizer}
                onChange={(event) =>
                  updateField("organizer", event.target.value)
                }
                disabled={pending}
                className={inputClass}
              />
            </Field>

            <Field label="Institution">
              <input
                type="text"
                required
                maxLength={200}
                value={form.institution}
                onChange={(event) =>
                  updateField("institution", event.target.value)
                }
                disabled={pending}
                className={inputClass}
              />
            </Field>

            <Field label="CAP list">
              <textarea
                rows={3}
                value={form.capList}
                onChange={(event) => updateField("capList", event.target.value)}
                disabled={pending}
                className={textareaClass}
                placeholder="One name per line"
              />
            </Field>

            <Field label="Tabber list">
              <textarea
                rows={3}
                value={form.tabberList}
                onChange={(event) =>
                  updateField("tabberList", event.target.value)
                }
                disabled={pending}
                className={textareaClass}
                placeholder="One name per line"
              />
            </Field>

            <Field label="Debater list">
              <textarea
                rows={4}
                value={form.debaterList}
                onChange={(event) =>
                  updateField("debaterList", event.target.value)
                }
                disabled={pending}
                className={textareaClass}
                placeholder="One name per line"
              />
            </Field>

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
                    ? "Create tournament"
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

const textareaClass =
  "w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium text-zinc-600">
        {label}
      </span>
      {children}
    </label>
  );
}
