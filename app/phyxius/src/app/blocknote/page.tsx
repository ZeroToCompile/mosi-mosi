import type { Metadata } from "next";
import Link from "next/link";
import { Editor } from "@/components/blocknote/DynamicEditor";

export const metadata: Metadata = {
  title: "BlockNote Showcase",
  description:
    "Interactive demo of BlockNote headings, lists, formatting, tables, code, and media.",
};

export default function BlockNotePage() {
  return (
    <div className="flex min-h-full flex-col bg-zinc-100 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Phyxius
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              BlockNote capabilities
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
        <p className="mb-6 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Sample document covering headings, inline styles, lists, quotes, code
          blocks, tables, and images. Edit anything — the live Markdown/JSON
          export updates as you type.
        </p>
        <Editor />
      </main>
    </div>
  );
}
