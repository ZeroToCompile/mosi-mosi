import type { Metadata } from "next";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MotionBank } from "@/components/motions/MotionBank";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Motion Bank — MosiMosi",
  description:
    "Browse, search, and filter debate motions by format, theme, and level.",
};

export default async function MotionsPage() {
  const session = await getSession();

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

      <header className="relative z-20 flex items-start justify-between px-5 pt-6 sm:px-8 md:px-10 md:pt-8">
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
          <Link href="/motions" className="landing-cta" data-active="true">
            Motions
          </Link>
          <a href="#matter" className="transition-opacity hover:opacity-70">
            Matter Bank
          </a>
          <a href="#docs" className="transition-opacity hover:opacity-70">
            Docs
          </a>
        </nav>
      </header>

      <main className="relative z-10 w-full px-5 pb-16 pt-10 sm:px-8 md:px-10 md:pt-12">
        <div className="landing-rise mb-8 max-w-2xl md:mb-10">
          <p className="mb-3 font-[family-name:var(--font-space)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
            Motion Bank
          </p>
          <h1 className="font-serif text-[clamp(2.5rem,7vw,4.75rem)] leading-[0.95] tracking-[-0.02em] text-[var(--ink)]">
            Find the motion.
            <br />
            Build the case.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
            A working catalogue of debate motions — filter by format, theme, and
            level. Mock set for now; real bank next.
          </p>
        </div>

        <MotionBank />
      </main>
    </div>
  );
}
