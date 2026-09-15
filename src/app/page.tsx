export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      {/* Atmospheric wash — keeps the field from reading as flat paint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(90% 70% at 12% 18%, var(--paper-glow), transparent 58%),
            radial-gradient(70% 55% at 88% 8%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 52%),
            linear-gradient(165deg, var(--bg) 0%, var(--bg-deep) 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Vertical brand mark */}
      <p
        className="landing-brand pointer-events-none absolute left-2 top-1/2 z-20 hidden origin-center -translate-y-1/2 -rotate-90 select-none text-sm font-semibold uppercase tracking-[0.38em] text-[var(--ink)] sm:left-4 sm:block md:left-6 md:text-base"
        aria-hidden
      >
        MosiMosi
      </p>

      <header className="relative z-10 flex items-start justify-between px-5 pt-6 sm:px-8 md:px-10 md:pt-8">
        <div className="landing-fade flex items-center gap-4">
          <button
            type="button"
            aria-label="Open menu"
            className="group flex h-10 w-10 flex-col items-start justify-center gap-[5px]"
          >
            <span className="block h-px w-5 bg-[var(--ink)] transition-transform group-hover:translate-x-0.5" />
            <span className="block h-px w-5 bg-[var(--ink)] transition-transform group-hover:translate-x-1" />
            <span className="block h-px w-3.5 bg-[var(--ink)] transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="font-serif text-2xl leading-none tracking-[-0.02em] text-[var(--ink)] sm:text-3xl">
            MosiMosi
          </p>
        </div>

        <div className="landing-rise landing-delay-1 max-w-[15rem] text-right sm:max-w-[17rem]">
          <nav
            aria-label="Primary"
            className="flex flex-wrap justify-end gap-x-5 gap-y-2 text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--accent)] sm:gap-x-6 sm:text-xs"
          >
            <a href="#motions" className="transition-opacity hover:opacity-70">
              Motions
            </a>
            <a href="#matter" className="transition-opacity hover:opacity-70">
              Matter Bank
            </a>
            <a href="#docs" className="transition-opacity hover:opacity-70">
              Docs
            </a>
          </nav>
          <p className="mt-4 text-left text-[12px] leading-relaxed text-[var(--muted)] sm:mt-5 sm:text-[13px]">
            MosiMosi helps debaters understand topics, connect ideas, and build
            better arguments.
          </p>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-10 pt-16 sm:px-8 md:px-10 md:pl-24 lg:pl-32">
        <h1 className="landing-rise landing-delay-2 max-w-4xl font-serif text-[clamp(2.75rem,8vw,6.25rem)] leading-[0.95] tracking-[-0.02em] text-[var(--ink)]">
          Know what you&apos;re
          <br />
          arguing about.
        </h1>
      </main>

      <footer className="relative z-10 px-5 pb-5 sm:px-8 md:px-10 md:pb-7">
        <div className="landing-fade landing-delay-4 border-t border-[var(--line)] pt-5 md:pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <label className="landing-search block w-full max-w-md border-b border-[var(--line)] pb-2 transition-colors">
              <span className="sr-only">Search topics, concepts, or motions</span>
              <input
                type="search"
                placeholder="Search topics, concepts, or motions..."
                className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
              />
            </label>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--accent)]">
              <a
                href="#explore"
                className="landing-cta"
                data-active="true"
              >
                Explore MosiMosi
              </a>
              <a href="#motions" className="landing-cta">
                Browse Motions
              </a>
            </div>
          </div>

          <p className="mt-6 text-[11px] tracking-wide text-[var(--muted)]">
            © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
