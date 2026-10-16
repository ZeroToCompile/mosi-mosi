"use client";

import { useMemo, useState } from "react";
import {
  articleLabelList,
  articleLabels,
  browseArticles,
  carries,
  LABEL_KINDS,
  labelCounts,
  labelHeading,
  sameLabel,
  type ArticleLabel,
  type LabelKind,
} from "@/lib/matter-articles";
import type { MatterNote } from "@/lib/matter-types";

type LayoutId = "index" | "lanes" | "reading";

const LAYOUTS: { id: LayoutId; label: string; note: string }[] = [
  {
    id: "index",
    label: "Index",
    note: "Every article once. Its labels sit beside it, with no folder above them.",
  },
  {
    id: "lanes",
    label: "Lanes",
    note: "Topics, groups, collections, and tags are parallel. None of them contains the others.",
  },
  {
    id: "reading",
    label: "Reading",
    note: "The article is the page. The labels are only where else it is filed.",
  },
];

export function MatterBrowse({
  initialLayout = "index",
}: {
  initialLayout?: LayoutId;
}) {
  const articles = browseArticles();
  const counts = useMemo(() => labelCounts(articles), [articles]);
  const [layout, setLayout] = useState<LayoutId>(initialLayout);
  const [active, setActive] = useState<ArticleLabel | null>(null);
  const [openId, setOpenId] = useState(articles[0]?.id ?? "");

  const visible = active
    ? articles.filter((article) => carries(article, active))
    : articles;
  const open = articles.find((article) => article.id === openId) ?? articles[0];

  const chooseLabel = (label: ArticleLabel) => {
    setActive((current) => (current && sameLabel(current, label) ? null : label));
  };

  const openArticle = (id: string) => {
    setOpenId(id);
    setLayout("reading");
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
        <h1 className="font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-none tracking-[-0.03em] text-[var(--ink)]">
          Browse
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2" role="tablist" aria-label="Layouts">
          {LAYOUTS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={layout === item.id}
              data-active={layout === item.id ? "true" : undefined}
              onClick={() => setLayout(item.id)}
              className={`landing-cta text-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${
                layout === item.id
                  ? "text-[var(--accent)]"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 max-w-[42rem] text-sm leading-relaxed text-[var(--muted)]">
        {LAYOUTS.find((item) => item.id === layout)?.note} An article can carry
        more than one of each.
      </p>

      {layout === "index" ? (
        <IndexLayout
          articles={visible}
          active={active}
          counts={counts}
          onLabel={chooseLabel}
          onOpen={openArticle}
        />
      ) : null}

      {layout === "lanes" ? (
        <LanesLayout
          articles={visible}
          active={active}
          counts={counts}
          onLabel={chooseLabel}
          onOpen={openArticle}
        />
      ) : null}

      {layout === "reading" && open ? (
        <ReadingLayout
          article={open}
          articles={articles}
          active={active}
          onLabel={chooseLabel}
          onOpen={openArticle}
        />
      ) : null}
    </div>
  );
}

function IndexLayout({
  articles,
  active,
  counts,
  onLabel,
  onOpen,
}: {
  articles: MatterNote[];
  active: ArticleLabel | null;
  counts: ReturnType<typeof labelCounts>;
  onLabel: (label: ArticleLabel) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mt-10">
      <LabelStrip counts={counts} active={active} onLabel={onLabel} />
      <ArticleList articles={articles} active={active} onOpen={onOpen} onLabel={onLabel} />
    </div>
  );
}

function LanesLayout({
  articles,
  active,
  counts,
  onLabel,
  onOpen,
}: {
  articles: MatterNote[];
  active: ArticleLabel | null;
  counts: ReturnType<typeof labelCounts>;
  onLabel: (label: ArticleLabel) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mt-10">
      <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
        {LABEL_KINDS.map((kind) => (
          <section key={kind} aria-labelledby={`lane-${kind}`}>
            <h2 id={`lane-${kind}`} className="text-sm text-[var(--muted)]">
              {labelHeading(kind)}
            </h2>
            <ul className="mt-3">
              {counts[kind].map((label) => {
                const selected = active ? sameLabel(active, label) : false;
                return (
                  <li key={`${label.kind}-${label.name}`}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onLabel(label)}
                      className={`flex w-full items-baseline justify-between gap-3 border-b border-[var(--line)] py-2 text-left text-[15px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${
                        selected
                          ? "text-[var(--accent)]"
                          : "text-[var(--ink)] hover:text-[var(--accent)]"
                      }`}
                    >
                      <span>{label.name}</span>
                      <span className="text-sm tabular-nums text-[var(--muted)]">
                        {label.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <ArticleList articles={articles} active={active} onOpen={onOpen} onLabel={onLabel} />
    </div>
  );
}

function ReadingLayout({
  article,
  articles,
  active,
  onLabel,
  onOpen,
}: {
  article: MatterNote;
  articles: MatterNote[];
  active: ArticleLabel | null;
  onLabel: (label: ArticleLabel) => void;
  onOpen: (id: string) => void;
}) {
  const labels = articleLabels(article);
  const relatedLabel = active && carries(article, active) ? active : null;
  const pool = relatedLabel
    ? articles.filter(
        (item) => item.id !== article.id && carries(item, relatedLabel),
      )
    : [];

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
      <article>
        <h2 className="max-w-[22ch] font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          {article.title}
        </h2>
        <p className="mt-5 max-w-[65ch] text-[15px] leading-relaxed text-[var(--ink-soft)]">
          {article.body}
        </p>
        {article.source ? (
          <p className="mt-4 text-sm text-[var(--muted)]">{article.source}</p>
        ) : null}
        {pool.length > 0 && relatedLabel ? (
          <div className="mt-10">
            <h3 className="text-sm text-[var(--muted)]">
              Also filed under {relatedLabel.name}
            </h3>
            <ul className="mt-3">
              {pool.map((item) => (
                <li key={item.id} className="border-b border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => onOpen(item.id)}
                    className="py-3 text-left font-serif text-xl tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>

      <aside className="lg:sticky lg:top-8">
        <h3 className="text-sm text-[var(--muted)]">Filed under</h3>
        <div className="mt-4 flex flex-col gap-6">
          {LABEL_KINDS.map((kind) =>
            labels[kind].length === 0 ? null : (
              <div key={kind}>
                <p className="text-sm text-[var(--muted)]">{labelHeading(kind)}</p>
                <ul className="mt-1">
                  {labels[kind].map((name) => {
                    const label = { kind, name };
                    const selected = active ? sameLabel(active, label) : false;
                    return (
                      <li key={name}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onLabel(label)}
                          className={`py-1 text-left text-[15px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${
                            selected
                              ? "text-[var(--accent)]"
                              : "text-[var(--ink)] hover:text-[var(--accent)]"
                          }`}
                        >
                          {name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
          )}
        </div>
      </aside>
    </div>
  );
}

function LabelStrip({
  counts,
  active,
  onLabel,
}: {
  counts: ReturnType<typeof labelCounts>;
  active: ArticleLabel | null;
  onLabel: (label: ArticleLabel) => void;
}) {
  const labels = LABEL_KINDS.flatMap((kind) => counts[kind]);
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {labels.map((label) => {
        const selected = active ? sameLabel(active, label) : false;
        return (
          <button
            key={`${label.kind}-${label.name}`}
            type="button"
            aria-pressed={selected}
            data-active={selected ? "true" : undefined}
            onClick={() => onLabel(label)}
            className={`landing-cta text-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${
              selected
                ? "text-[var(--accent)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {label.name}
          </button>
        );
      })}
    </div>
  );
}

function ArticleList({
  articles,
  active,
  onOpen,
  onLabel,
}: {
  articles: MatterNote[];
  active: ArticleLabel | null;
  onOpen: (id: string) => void;
  onLabel: (label: ArticleLabel) => void;
}) {
  if (articles.length === 0) {
    return (
      <p className="mt-10 font-serif text-2xl text-[var(--ink)]">
        No article carries {active?.name}.
      </p>
    );
  }

  return (
    <ul className="mt-8 border-t border-[var(--line)]">
      {articles.map((article) => (
        <li key={article.id} className="border-b border-[var(--line)] py-6">
          <button
            type="button"
            onClick={() => onOpen(article.id)}
            className="text-left font-serif text-[1.55rem] leading-[1.15] tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            {article.title}
          </button>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
            {articleLabelList(article).map((label) => {
              const selected = active ? sameLabel(active, label) : false;
              return (
                <button
                  key={`${label.kind}-${label.name}`}
                  type="button"
                  onClick={() => onLabel(label)}
                  className={
                    selected
                      ? "text-[var(--accent)]"
                      : "hover:text-[var(--ink)]"
                  }
                >
                  {label.name}
                </button>
              );
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
