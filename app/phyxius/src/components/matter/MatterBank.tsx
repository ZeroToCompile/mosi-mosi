"use client";

import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  countThisWeek,
  formatDateKey,
  keywordForDate,
  MATTER_KINDS,
  MATTER_THEMES,
  SEED_MATTERS,
  type MatterKind,
  type MatterNote,
  type MatterTheme,
} from "@/lib/matter-types";
import { loadMatterNotes, saveMatterNotes } from "@/lib/matter-storage";

type SortKey = "newest" | "az" | "kind";

type MatterBankProps = {
  today: string;
};

type Draft = {
  title: string;
  body: string;
  kind: MatterKind;
  theme: MatterTheme;
  source: string;
  tags: string;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  body: "",
  kind: "Fact",
  theme: "Society",
  source: "",
  tags: "",
};

function matchesQuery(note: MatterNote, query: string) {
  if (!query) return true;
  const haystack = [
    note.title,
    note.body,
    note.kind,
    note.theme,
    note.source ?? "",
    ...note.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function MatterBank({ today }: MatterBankProps) {
  const [notes, setNotes] = useState<MatterNote[]>(SEED_MATTERS);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MatterKind | "All">("All");
  const [theme, setTheme] = useState<MatterTheme | "All">("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const [highlightedOnly, setHighlightedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const searchId = useId();
  const filterId = useId();
  const composerId = useId();

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const keyword = keywordForDate(today);

  useEffect(() => {
    setNotes(loadMatterNotes());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveMatterNotes(notes);
  }, [hydrated, notes]);

  const filtered = useMemo(() => {
    const list = notes.filter((note) => {
      if (highlightedOnly && !note.highlighted) return false;
      if (kind !== "All" && note.kind !== kind) return false;
      if (theme !== "All" && note.theme !== theme) return false;
      return matchesQuery(note, deferredQuery);
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "kind") {
        return (
          a.kind.localeCompare(b.kind) ||
          b.createdAt.localeCompare(a.createdAt) ||
          a.title.localeCompare(b.title)
        );
      }
      return (
        b.createdAt.localeCompare(a.createdAt) || a.title.localeCompare(b.title)
      );
    });
    return sorted;
  }, [deferredQuery, highlightedOnly, kind, notes, sort, theme]);

  const themesInBank = new Set(notes.map((note) => note.theme)).size;
  const highlightedCount = notes.filter((note) => note.highlighted).length;
  const addedThisWeek = countThisWeek(notes, today);

  const searching = query.trim() !== "";
  const showingResults = searching || theme !== "All";
  const filtersActive =
    kind !== "All" || theme !== "All" || sort !== "newest";
  const hasActiveFilters = searching || filtersActive || highlightedOnly;

  const clearFilters = () => {
    setQuery("");
    setKind("All");
    setTheme("All");
    setSort("newest");
    setHighlightedOnly(false);
    setActiveId(null);
  };

  const toggleHighlight = (id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, highlighted: !note.highlighted } : note,
      ),
    );
  };

  const saveDraft = () => {
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title || !body) {
      setFormError("A matter needs a title and a note.");
      return;
    }

    const note: MatterNote = {
      id: `matter-${crypto.randomUUID()}`,
      title,
      body,
      kind: draft.kind,
      theme: draft.theme,
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      source: draft.source.trim() || null,
      highlighted: false,
      createdAt: new Date().toISOString(),
    };

    setNotes((current) => [note, ...current]);
    setDraft(EMPTY_DRAFT);
    setFormError(null);
    setComposerOpen(false);
    setKind("All");
    setTheme("All");
    setHighlightedOnly(false);
    setQuery("");
    setSort("newest");
    setActiveId(note.id);
    window.setTimeout(() => {
      document.getElementById(`matter-${note.id}`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    }, 60);
  };

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-5 bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-5 pb-4 pt-2 backdrop-blur-md sm:-mx-8 sm:px-8 md:-mx-10 md:px-10">
        <label
          htmlFor={searchId}
          className="landing-search block border-b border-[var(--line)] pb-2 transition-colors"
        >
          <span className="sr-only">Search the matter bank</span>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveId(null);
            }}
            placeholder="Search facts, framings, examples…"
            className="w-full bg-transparent font-serif text-2xl leading-tight tracking-[-0.02em] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus-visible:outline-none"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ToolbarButton
            pressed={filtersActive}
            expanded={filtersOpen}
            controls={filterId}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            Filter
          </ToolbarButton>
          <ToolbarButton
            pressed={highlightedOnly}
            onClick={() => setHighlightedOnly((value) => !value)}
          >
            Highlighted
          </ToolbarButton>
          <ToolbarButton
            pressed={composerOpen}
            expanded={composerOpen}
            controls={composerId}
            tone="solid"
            onClick={() => {
              setComposerOpen((open) => !open);
              setFormError(null);
            }}
          >
            New matter
          </ToolbarButton>

          <p
            aria-live="polite"
            className={
              showingResults
                ? "ml-auto text-sm text-[var(--muted)]"
                : "sr-only"
            }
          >
            {filtered.length} {filtered.length === 1 ? "note" : "notes"}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="landing-cta text-sm text-[var(--accent)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div
          id={filterId}
          className="landing-rise mt-8 grid gap-8 md:grid-cols-3"
        >
          <FilterGroup label="Kind">
            <FilterChip active={kind === "All"} onClick={() => setKind("All")}>
              All
            </FilterChip>
            {MATTER_KINDS.map((item) => (
              <FilterChip
                key={item}
                active={kind === item}
                onClick={() => setKind(item)}
              >
                {item}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Theme">
            <FilterChip
              active={theme === "All"}
              onClick={() => setTheme("All")}
            >
              All
            </FilterChip>
            {MATTER_THEMES.map((item) => (
              <FilterChip
                key={item}
                active={theme === item}
                onClick={() => setTheme(item)}
              >
                {item}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Sort">
            <FilterChip
              active={sort === "newest"}
              onClick={() => setSort("newest")}
            >
              Newest
            </FilterChip>
            <FilterChip active={sort === "az"} onClick={() => setSort("az")}>
              A–Z
            </FilterChip>
            <FilterChip
              active={sort === "kind"}
              onClick={() => setSort("kind")}
            >
              Kind
            </FilterChip>
          </FilterGroup>
        </div>
      ) : null}

      {composerOpen ? (
        <form
          id={composerId}
          className="landing-rise mt-8 border-t border-[var(--line)] pt-6"
          onSubmit={(event) => {
            event.preventDefault();
            saveDraft();
          }}
        >
          <p className="font-serif text-3xl tracking-[-0.02em] text-[var(--ink)]">
            New matter
          </p>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm text-[var(--muted)]">
              Title
            </span>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="The line you want to find again"
              className="w-full border-b border-[var(--line)] bg-transparent pb-2 font-serif text-2xl text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm text-[var(--muted)]">
              Note
            </span>
            <textarea
              value={draft.body}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  body: event.target.value,
                }))
              }
              rows={4}
              placeholder="The fact, the example, or how you will use it."
              className="w-full resize-y border-b border-[var(--line)] bg-transparent py-2 text-sm leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
            />
          </label>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FilterGroup label="Kind">
              {MATTER_KINDS.map((item) => (
                <FilterChip
                  key={item}
                  active={draft.kind === item}
                  onClick={() =>
                    setDraft((current) => ({ ...current, kind: item }))
                  }
                >
                  {item}
                </FilterChip>
              ))}
            </FilterGroup>
            <FilterGroup label="Theme">
              {MATTER_THEMES.map((item) => (
                <FilterChip
                  key={item}
                  active={draft.theme === item}
                  onClick={() =>
                    setDraft((current) => ({ ...current, theme: item }))
                  }
                >
                  {item}
                </FilterChip>
              ))}
            </FilterGroup>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-[var(--muted)]">
                Source
              </span>
              <input
                value={draft.source}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    source: event.target.value,
                  }))
                }
                placeholder="Optional"
                className="w-full border-b border-[var(--line)] bg-transparent pb-2 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-[var(--muted)]">
                Tags
              </span>
              <input
                value={draft.tags}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                placeholder="weighing, link, labour"
                className="w-full border-b border-[var(--line)] bg-transparent pb-2 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
              />
            </label>
          </div>

          {formError ? (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="landing-cta text-sm text-[var(--accent)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              data-active="true"
            >
              Save matter
            </button>
            <button
              type="button"
              onClick={() => {
                setComposerOpen(false);
                setFormError(null);
              }}
              className="landing-cta text-sm text-[var(--muted)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              Cancel
            </button>
            <p className="text-[12px] text-[var(--muted)]">
              Stays in this browser for now.
            </p>
          </div>
        </form>
      ) : null}

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start lg:gap-x-16">
      <section aria-labelledby="keyword-of-the-day" className="lg:col-start-1">
        <h1
          id="keyword-of-the-day"
          className="font-serif text-[clamp(3.25rem,8vw,6rem)] leading-[0.9] tracking-[-0.03em] text-[var(--ink)]"
        >
          <span className="mb-3 block font-sans text-sm font-normal tracking-normal text-[var(--muted)]">
            Keyword of the day, {formatDateKey(today)}
          </span>
          {keyword.term}
        </h1>
        <p className="mt-5 max-w-[38rem] text-[15px] leading-relaxed text-[var(--ink-soft)]">
          {keyword.gloss}
        </p>
        <button
          type="button"
          onClick={() => {
            setHighlightedOnly(false);
            setKind("All");
            setTheme("All");
            setActiveId(null);
            setQuery(keyword.term);
          }}
          className="landing-cta mt-5 inline-block text-sm text-[var(--accent)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          Search this word
        </button>
        <Link
          href="/matter/browse"
          className="landing-cta ml-6 inline-block text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          Browse
        </Link>
      </section>

      <aside
        aria-labelledby="topics-heading"
        className="mt-12 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mt-1 lg:sticky lg:top-28"
      >
        <h2 id="topics-heading" className="text-sm text-[var(--muted)]">
          Topics
        </h2>
        <ul className="mt-2">
          {MATTER_THEMES.map((item) => {
            const count = notes.filter((note) => note.theme === item).length;
            const active = theme === item;
            return (
              <li key={item} className="border-b border-[var(--line)]">
                <button
                  type="button"
                  aria-pressed={active}
                  data-active={active ? "true" : undefined}
                  onClick={() => {
                    setKind("All");
                    setHighlightedOnly(false);
                    setActiveId(null);
                    setQuery("");
                    setTheme(active ? "All" : item);
                  }}
                  className={`flex w-full items-baseline justify-between gap-4 py-2.5 text-left text-[15px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${
                    active
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span>{item}</span>
                  <span className="text-sm tabular-nums text-[var(--muted)]">
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {showingResults ? (
      <section aria-label="Search results" className="mt-10 lg:col-start-1">
      <ul className="flex flex-col border-t border-[var(--line)]">
        {filtered.length === 0 ? (
          <li className="py-10">
            <p className="font-serif text-2xl text-[var(--ink)]">No notes match.</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              {highlightedOnly
                ? "Nothing highlighted matches. Clear Highlighted, or mark a note."
                : "Clear the search, or write a new matter."}
            </p>
          </li>
        ) : (
          filtered.map((note) => (
            <li
              key={note.id}
              id={`matter-${note.id}`}
              className={`motion-row scroll-mt-28 border-b border-[var(--line)] ${
                activeId === note.id
                  ? "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]"
                  : ""
              }`}
            >
              <article className="grid gap-3 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <div className="min-w-0">
                  <h3 className="font-serif text-[1.45rem] leading-[1.2] tracking-[-0.02em] text-[var(--ink)] sm:text-[1.65rem]">
                    <MarkedText text={note.title} query={deferredQuery} />
                  </h3>
                  <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-[var(--ink-soft)]">
                    <MarkedText text={note.body} query={deferredQuery} />
                  </p>
                  <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-[var(--muted)]">
                    {[
                      note.kind,
                      note.theme,
                      formatDateKey(note.createdAt.slice(0, 10)),
                      note.source,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    {note.tags.map((tag) => (
                      <span key={tag}>
                        {", "}
                        <MarkedText text={tag} query={deferredQuery} />
                      </span>
                    ))}
                  </p>
                </div>

                <button
                  type="button"
                  aria-pressed={note.highlighted}
                  onClick={() => toggleHighlight(note.id)}
                  className={`landing-cta justify-self-start text-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] md:justify-self-end ${
                    note.highlighted
                      ? "text-[var(--accent)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                  data-active={note.highlighted ? "true" : undefined}
                >
                  {note.highlighted ? "Highlighted" : "Highlight"}
                </button>
              </article>
            </li>
          ))
        )}
      </ul>
      </section>
      ) : null}

      <p className="mt-8 text-sm text-[var(--muted)] lg:col-start-1">
        {notes.length} notes, {highlightedCount} highlighted, across{" "}
        {themesInBank} themes. {addedThisWeek} added this week.
      </p>
      </div>
    </div>
  );
}

function ToolbarButton({
  pressed,
  onClick,
  controls,
  expanded,
  tone = "ghost",
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  controls?: string;
  expanded?: boolean;
  tone?: "ghost" | "solid";
  children: ReactNode;
}) {
  const open = expanded ?? pressed;
  const hot = pressed || open || tone === "solid";

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-expanded={expanded}
      aria-controls={controls}
      data-active={open ? "true" : undefined}
      onClick={onClick}
      className={`landing-cta text-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${
        hot
          ? "text-[var(--accent)]"
          : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-[var(--muted)]">{label}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-active={active ? "true" : undefined}
      className={`landing-cta text-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${
        active
          ? "text-[var(--ink)]"
          : "text-[var(--muted)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function MarkedText({ text, query }: { text: string; query: string }) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((part, index) =>
    part.toLowerCase() === query ? (
      <mark
        key={`${part}-${index}`}
        className="bg-[color-mix(in_srgb,var(--accent)_24%,transparent)] text-inherit"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}
