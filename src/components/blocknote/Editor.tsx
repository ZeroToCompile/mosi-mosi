"use client";

import type { Block, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useCallback, useEffect, useState } from "react";

const initialContent: PartialBlock[] = [
  {
    type: "heading",
    props: { level: 1 },
    content: "BlockNote showcase",
  },
  {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: "A Notion-style block editor. Try the tips on the right, then edit this document freely.",
        styles: {},
      },
    ],
  },
  { type: "divider" },
  {
    type: "heading",
    props: { level: 2 },
    content: "Inline formatting",
  },
  {
    type: "paragraph",
    content: [
      { type: "text", text: "Select text to open the toolbar: ", styles: {} },
      { type: "text", text: "bold", styles: { bold: true } },
      { type: "text", text: ", ", styles: {} },
      { type: "text", text: "italic", styles: { italic: true } },
      { type: "text", text: ", ", styles: {} },
      { type: "text", text: "underline", styles: { underline: true } },
      { type: "text", text: ", ", styles: {} },
      { type: "text", text: "strikethrough", styles: { strike: true } },
      { type: "text", text: ", ", styles: {} },
      { type: "text", text: "code", styles: { code: true } },
      { type: "text", text: ", and ", styles: {} },
      {
        type: "link",
        href: "https://www.blocknotejs.org",
        content: [{ type: "text", text: "links", styles: {} }],
      },
      { type: "text", text: ".", styles: {} },
    ],
  },
  {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: "Colored text",
        styles: { textColor: "blue", bold: true },
      },
      { type: "text", text: " and ", styles: {} },
      {
        type: "text",
        text: "highlighted backgrounds",
        styles: { backgroundColor: "yellow" },
      },
      { type: "text", text: " are available from the color picker.", styles: {} },
    ],
  },
  {
    type: "heading",
    props: { level: 2 },
    content: "Lists",
  },
  {
    type: "bulletListItem",
    content: "Bullet lists for unstructured notes",
  },
  {
    type: "bulletListItem",
    content: "Nest items with Tab / Shift+Tab",
    children: [
      {
        type: "bulletListItem",
        content: "Nested bullet",
      },
    ],
  },
  {
    type: "numberedListItem",
    content: "Numbered lists for steps",
  },
  {
    type: "numberedListItem",
    content: "They continue automatically",
  },
  {
    type: "checkListItem",
    props: { checked: true },
    content: "Checklist items track progress",
  },
  {
    type: "checkListItem",
    props: { checked: false },
    content: "Click the box to toggle",
  },
  {
    type: "toggleListItem",
    content: "Toggle lists hide nested content",
    children: [
      {
        type: "paragraph",
        content: "This paragraph is nested under the toggle.",
      },
    ],
  },
  {
    type: "heading",
    props: { level: 2 },
    content: "Quotes, code & tables",
  },
  {
    type: "quote",
    content: "Quotes call out important lines without leaving the flow.",
  },
  {
    type: "codeBlock",
    props: { language: "typescript" },
    content: `function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet("BlockNote"));`,
  },
  {
    type: "table",
    content: {
      type: "tableContent",
      rows: [
        { cells: ["Feature", "How to try it", "Shortcut"] },
        { cells: ["Slash menu", "Type / in an empty block", "/"] },
        { cells: ["Formatting", "Select text", "Mod+B / Mod+I"] },
        { cells: ["Drag handle", "Hover left of a block", "—"] },
      ],
    },
  },
  {
    type: "heading",
    props: { level: 2 },
    content: "Media",
  },
  {
    type: "image",
    props: {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=960&q=80",
      caption: "Images support captions and resizing from the side handles",
      previewWidth: 560,
    },
  },
  { type: "divider" },
  {
    type: "paragraph",
    content:
      "Press / for headings, lists, tables, code, media, and more — then keep typing.",
  },
];

type PreviewTab = "json" | "markdown";
type Theme = "light" | "dark";

export default function Editor() {
  const [theme, setTheme] = useState<Theme>("light");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("markdown");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [markdown, setMarkdown] = useState("");

  const editor = useCreateBlockNote({ initialContent });

  const syncPreview = useCallback(() => {
    setBlocks(editor.document);
    setMarkdown(editor.blocksToMarkdownLossy(editor.document));
  }, [editor]);

  useEffect(() => {
    syncPreview();
  }, [syncPreview]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
      <div className="flex min-h-[28rem] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Live editor
            </p>
            <p className="text-xs text-zinc-500">
              Formatting toolbar · slash menu · drag handles
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            {theme === "light" ? "Dark theme" : "Light theme"}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <BlockNoteView
            editor={editor}
            theme={theme}
            onChange={syncPreview}
          />
        </div>
      </div>

      <aside className="flex w-full min-h-[20rem] flex-col gap-4 lg:w-[22rem] xl:w-[26rem]">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Try these
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              Type <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-900">/</kbd> for the slash menu
            </li>
            <li>Select text to format, link, or recolor</li>
            <li>Hover a block’s left edge to drag or open the menu</li>
            <li>Nest list items with Tab / Shift+Tab</li>
            <li>Watch JSON and Markdown update live below</li>
          </ul>
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-1 border-b border-zinc-200 p-2 dark:border-zinc-800">
            {(
              [
                ["markdown", "Markdown"],
                ["json", "JSON"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreviewTab(id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  previewTab === id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <pre className="min-h-0 flex-1 overflow-auto p-4 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
            <code>
              {previewTab === "markdown"
                ? markdown || "…"
                : JSON.stringify(blocks, null, 2)}
            </code>
          </pre>
        </section>
      </aside>
    </div>
  );
}
