"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const primaryNav: NavItem[] = [
  {
    href: "/motions",
    label: "Motions",
    description: "Browse this week’s topics",
    icon: <IconMotions />,
  },
  {
    href: "#matter",
    label: "Matter Bank",
    description: "Evidence & framing notes",
    icon: <IconLibrary />,
  },
  {
    href: "#docs",
    label: "Docs",
    description: "Guides & case shells",
    icon: <IconDocs />,
  },
  {
    href: "#practice",
    label: "Practice",
    description: "Drills & timed rounds",
    icon: <IconTarget />,
  },
];

const secondaryNav: NavItem[] = [
  {
    href: "#topics",
    label: "Topics",
    description: "Concept map",
    icon: <IconCompass />,
  },
  {
    href: "#community",
    label: "Community",
    description: "Clubs & rooms",
    icon: <IconUsers />,
  },
  {
    href: "#settings",
    label: "Settings",
    description: "Profile & prefs",
    icon: <IconSettings />,
  },
];

type AppSidebarProps = {
  signedIn?: boolean;
};

export function AppSidebar({ signedIn = false }: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const overlay =
    mounted &&
    createPortal(
      <>
        <div
          className={`sidebar-backdrop fixed inset-0 z-[200] bg-[color-mix(in_srgb,var(--ink)_32%,transparent)] backdrop-blur-[2px] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!open}
          onClick={() => setOpen(false)}
        />

        <aside
          id="app-sidebar"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-hidden={!open}
          inert={!open ? true : undefined}
          className={`sidebar-panel fixed inset-y-0 left-0 z-[210] flex w-[min(20rem,84vw)] flex-col text-[var(--sidebar-ink)] md:w-[22%] ${
            open ? "sidebar-panel--open" : "sidebar-panel--closed"
          }`}
        >
        <div className="sidebar-velvet pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-[1] flex h-full flex-col px-5 pb-6 pt-7 font-sidebar sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                id={titleId}
                className="text-[1.65rem] font-semibold leading-none tracking-[-0.04em] text-[var(--sidebar-ink)]"
              >
                MosiMosi
              </p>
              <p className="mt-1.5 text-[12px] font-medium tracking-[0.08em] uppercase text-[var(--sidebar-muted)]">
                Debate studio
              </p>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-[12px] font-medium tracking-[0.08em] uppercase text-[var(--sidebar-muted)]">
              Today
            </p>
            <p className="mt-1.5 text-[1.05rem] font-medium leading-snug tracking-[-0.03em] text-[var(--sidebar-ink)]">
              This house would ban generative AI in competitive debating.
            </p>
          </div>

          <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1" aria-label="Site">
            <NavSection title="Explore" items={primaryNav} onNavigate={() => setOpen(false)} />
            <NavSection title="Workspace" items={secondaryNav} onNavigate={() => setOpen(false)} />
          </nav>

          <div className="mt-3 border-t border-[var(--sidebar-line)] pt-3">
            {signedIn ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="sidebar-link flex items-center gap-2.5 px-1 py-1.5 text-[var(--sidebar-ink)] transition-colors hover:bg-[var(--sidebar-hover)]"
              >
                <span className="sidebar-icon grid h-8 w-8 place-items-center text-[var(--sidebar-ink)]">
                  <IconShield />
                </span>
                <span>
                  <span className="block text-[0.95rem] font-semibold tracking-[-0.02em]">
                    Admin
                  </span>
                  <span className="block text-[13px] tracking-[-0.01em] text-[var(--sidebar-muted)]">
                    Access control
                  </span>
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="sidebar-link flex items-center gap-2.5 px-1 py-1.5 text-[var(--sidebar-ink)] transition-colors hover:bg-[var(--sidebar-hover)]"
              >
                <span className="sidebar-icon grid h-8 w-8 place-items-center text-[var(--sidebar-ink)]">
                  <IconLogin />
                </span>
                <span>
                  <span className="block text-[0.95rem] font-semibold tracking-[-0.02em]">
                    Sign in
                  </span>
                  <span className="block text-[13px] tracking-[-0.01em] text-[var(--sidebar-muted)]">
                    Save progress & rooms
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={`sidebar-close absolute top-1/2 left-full z-[220] ml-2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-[var(--sidebar-bubble)] text-[var(--sidebar-ink)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--sidebar-bubble-hot)] ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <IconChevronLeft />
        </button>
        </aside>
      </>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="app-sidebar"
        onClick={() => setOpen(true)}
        className="group flex h-10 w-10 flex-col items-start justify-center gap-[5px]"
      >
        <span className="block h-px w-5 bg-[var(--ink)] transition-transform duration-300 group-hover:translate-x-0.5" />
        <span className="block h-px w-5 bg-[var(--ink)] transition-transform duration-300 group-hover:translate-x-1" />
        <span className="block h-px w-3.5 bg-[var(--ink)] transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>
      {overlay}
    </>
  );
}

function NavSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="mb-1 px-1 text-[12px] font-medium tracking-[0.08em] uppercase text-[var(--sidebar-muted)]">
        {title}
      </p>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              onClick={onNavigate}
              className="sidebar-link group flex items-center gap-2.5 px-1 py-1.5 transition-colors hover:bg-[var(--sidebar-hover)]"
            >
              <span className="sidebar-icon grid h-8 w-8 shrink-0 place-items-center text-[var(--sidebar-ink)]">
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.95rem] font-semibold tracking-[-0.02em] text-[var(--sidebar-ink)]">
                  {item.label}
                </span>
                <span className="block truncate text-[13px] tracking-[-0.01em] text-[var(--sidebar-muted)]">
                  {item.description}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconMotions() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4v16M17 4v16M4 8h6M14 16h6M4 16h6M14 8h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLibrary() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19.5V6.2c0-.7.4-1.3 1-1.6l6-2.8c.6-.3 1.4-.3 2 0l6 2.8c.6.3 1 .9 1 1.6V19.5M4 19.5h16M8 10v6M12 8v8M16 11v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDocs() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 3h6l4 4v14H8V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v4h4M10 12h6M10 16h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m14.8 9.2-1.4 4.2-4.2 1.4 1.4-4.2 4.2-1.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 20v-1.2A3.8 3.8 0 0 0 12.2 15H7.8A3.8 3.8 0 0 0 4 18.8V20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M20 20v-1a3 3 0 0 0-2.2-2.9M15.5 5.2a3 3 0 0 1 0 5.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 16l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 5 6.2v5.3c0 4.2 2.9 7.9 7 8.9 4.1-1 7-4.7 7-8.9V6.2L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4M14 12H21M18 9l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
