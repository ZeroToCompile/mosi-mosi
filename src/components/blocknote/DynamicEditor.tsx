"use client";

import dynamic from "next/dynamic";

export const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[28rem] flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
      Loading BlockNote…
    </div>
  ),
});
