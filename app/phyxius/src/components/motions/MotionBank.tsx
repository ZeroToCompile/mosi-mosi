"use client";

import {
  useDeferredValue,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_MOTIONS,
  MOTION_DIFFICULTIES,
  MOTION_FORMATS,
  MOTION_THEMES,
  type Motion,
  type MotionDifficulty,
  type MotionFormat,
  type MotionTheme,
} from "@/data/motions";

type SortKey = "newest" | "oldest" | "az";

function matchesQuery(motion: Motion, query: string) {
  if (!query) return true;
  const haystack = [
    motion.text,
    motion.format,
    motion.theme,
    motion.difficulty,
    motion.tournament ?? "",
    ...motion.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function MotionBank() {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<MotionFormat | "All">("All");
  const [theme, setTheme] = useState<MotionTheme | "All">("All");
  const [difficulty, setDifficulty] = useState<MotionDifficulty | "All">(
    "All",
  );
  const [sort, setSort] = useState<SortKey>("newest");

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    const list = MOCK_MOTIONS.filter((motion) => {
      if (format !== "All" && motion.format !== format) return false;
      if (theme !== "All" && motion.theme !== theme) return false;
      if (difficulty !== "All" && motion.difficulty !== difficulty)
        return false;
      return matchesQuery(motion, deferredQuery);
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "az") return a.text.localeCompare(b.text);
      if (sort === "oldest") return a.year - b.year || a.id.localeCompare(b.id);
      return b.year - a.year || a.id.localeCompare(b.id);
    });
    return sorted;
  }, [deferredQuery, difficulty, format, sort, theme]);

  const clearFilters = () => {
    setQuery("");
    setFormat("All");
    setTheme("All");
    setDifficulty("All");
    setSort("newest");
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    format !== "All" ||
    theme !== "All" ||
    difficulty !== "All" ||
    sort !== "newest";

  return (
    <div className="landing-rise landing-delay-2 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15.5rem] lg:items-start lg:gap-x-14 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-x-16">
      <div className="border-y border-[var(--ink)] py-4 md:py-5 lg:col-start-1">
        <label className="block">
          <span className="mb-2 block font-[family-name:var(--font-space)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink)]">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Motion text, tag, tournament…"
            className="w-full border-b-2 border-[var(--ink)] bg-transparent pb-2 font-serif text-xl text-[var(--ink)] outline-none placeholder:text-[var(--muted)] sm:text-2xl"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-[family-name:var(--font-space)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {filtered.length} motion{filtered.length === 1 ? "" : "s"}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="font-[family-name:var(--font-space)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] transition-opacity hover:opacity-70 lg:hidden"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <aside className="border-t border-[var(--ink)] pt-5 lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:self-start lg:border-t-0 lg:border-l lg:border-[var(--ink)] lg:pt-0 lg:pl-8 xl:pl-10">
        <div className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
          <p className="font-[family-name:var(--font-space)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink)]">
            Filters
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="hidden font-[family-name:var(--font-space)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] transition-opacity hover:opacity-70 lg:inline"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <FilterGroup label="Format">
            <FilterChip
              active={format === "All"}
              onClick={() => setFormat("All")}
            >
              All
            </FilterChip>
            {MOTION_FORMATS.map((item) => (
              <FilterChip
                key={item}
                active={format === item}
                onClick={() => setFormat(item)}
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
            {MOTION_THEMES.map((item) => (
              <FilterChip
                key={item}
                active={theme === item}
                onClick={() => setTheme(item)}
              >
                {item}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Level">
            <FilterChip
              active={difficulty === "All"}
              onClick={() => setDifficulty("All")}
            >
              All
            </FilterChip>
            {MOTION_DIFFICULTIES.map((item) => (
              <FilterChip
                key={item}
                active={difficulty === item}
                onClick={() => setDifficulty(item)}
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
            <FilterChip
              active={sort === "oldest"}
              onClick={() => setSort("oldest")}
            >
              Oldest
            </FilterChip>
            <FilterChip active={sort === "az"} onClick={() => setSort("az")}>
              A–Z
            </FilterChip>
          </FilterGroup>
        </div>
      </aside>

      <ul className="landing-rise landing-delay-3 flex flex-col lg:col-start-1">
        {filtered.length === 0 ? (
          <li className="border-b border-[var(--line)] py-10">
            <p className="font-serif text-2xl text-[var(--ink)]">No matches.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Try a broader search or clear the filters.
            </p>
          </li>
        ) : (
          filtered.map((motion, index) => (
            <li
              key={motion.id}
              className="motion-row group border-b border-[var(--line)]"
            >
              <article className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-5 sm:gap-x-6 md:grid-cols-[3.5rem_1fr_auto] md:items-start md:py-6">
                <span className="pt-1 font-[family-name:var(--font-space)] text-xs font-semibold tabular-nums tracking-[0.12em] text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h2 className="font-serif text-[1.35rem] leading-[1.2] tracking-[-0.015em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] sm:text-[1.55rem] md:text-[1.7rem]">
                    {motion.text}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-[family-name:var(--font-space)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    <span className="text-[var(--ink)]">{motion.format}</span>
                    <span aria-hidden className="text-[var(--line)]">
                      /
                    </span>
                    <span>{motion.theme}</span>
                    <span aria-hidden className="text-[var(--line)]">
                      /
                    </span>
                    <span>{motion.difficulty}</span>
                    {motion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[var(--ink-soft)] before:mr-3 before:text-[var(--line)] before:content-['/']"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-start-2 flex flex-col gap-1 md:col-start-3 md:items-end md:text-right">
                  <p className="font-[family-name:var(--font-space)] text-sm font-semibold tabular-nums tracking-wide text-[var(--ink)]">
                    {motion.year}
                  </p>
                  {motion.tournament ? (
                    <p className="text-[11px] tracking-wide text-[var(--muted)]">
                      {motion.tournament}
                    </p>
                  ) : (
                    <p className="text-[11px] tracking-wide text-[var(--muted)]">
                      Practice set
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))
        )}
      </ul>
    </div>
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
      <p className="mb-2.5 font-[family-name:var(--font-space)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
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
      className={`border px-2.5 py-1 font-[family-name:var(--font-space)] text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
          : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}
