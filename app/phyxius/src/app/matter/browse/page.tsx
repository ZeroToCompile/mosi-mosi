import type { Metadata } from "next";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MatterBrowse } from "@/components/matter/MatterBrowse";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Browse — Matter Bank — MosiMosi",
  description:
    "Browse articles filed by topic, group, collection, and tag.",
};

function layoutFromQuery(value: string | undefined) {
  if (value === "lanes" || value === "reading" || value === "index") return value;
  return "index" as const;
}

export default async function MatterBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ layout?: string }>;
}) {
  const session = await getSession();
  const { layout } = await searchParams;

  return (
    <div className="relative min-h-dvh bg-[var(--bg)] text-[var(--ink)]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: `
            radial-gradient(70% 50% at 8% 0%, var(--paper-glow), transparent 55%),
            linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.28] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      <header className="relative z-30 flex items-start justify-between px-5 pt-6 sm:px-8 md:px-10 md:pt-8">
        <div className="landing-fade flex items-center gap-4">
          <AppSidebar signedIn={Boolean(session)} />
          <Link
            href="/"
            className="font-serif text-2xl leading-none tracking-[-0.02em] text-[var(--ink)] transition-opacity hover:opacity-70 sm:text-3xl"
          >
            MosiMosi
          </Link>
        </div>

        <nav
          aria-label="Primary"
          className="landing-rise landing-delay-1 flex flex-wrap justify-end gap-x-5 gap-y-2 text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--accent)] sm:gap-x-6 sm:text-xs"
        >
          <Link href="/matter" className="transition-opacity hover:opacity-70">
            Matter Bank
          </Link>
          <Link href="/matter/browse" className="landing-cta" data-active="true">
            Browse
          </Link>
        </nav>
      </header>

      <main className="relative z-10 w-full px-5 pb-16 pt-8 sm:px-8 md:px-10 md:pt-10">
        <MatterBrowse initialLayout={layoutFromQuery(layout)} />
      </main>
    </div>
  );
}
