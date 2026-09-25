"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/lib/admin";

type AdminShellProps = {
  userLabel: string;
  children: React.ReactNode;
};

export function AdminShell({ userLabel, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-white text-zinc-900">
      <div className="flex min-h-dvh flex-col md:flex-row">
        <aside className="shrink-0 border-b border-zinc-200 bg-white md:flex md:w-56 md:flex-col md:border-r md:border-b-0">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 md:block md:py-4">
            <div>
              <p className="text-sm font-semibold tracking-tight">
                MosiMosi Admin
              </p>
              <p className="mt-0.5 hidden text-xs text-zinc-500 md:block">
                Access control
              </p>
            </div>
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-900 md:hidden"
            >
              Site
            </Link>
          </div>

          <nav
            className="flex gap-1 overflow-x-auto p-2 md:flex-1 md:flex-col md:overflow-visible"
            aria-label="Admin"
          >
            {adminNavItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md px-3 py-2 transition-colors md:shrink ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span
                    className={`mt-0.5 hidden text-[11px] md:block ${
                      active ? "text-zinc-300" : "text-zinc-500"
                    }`}
                  >
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden border-t border-zinc-200 p-3 md:block">
            <p className="truncate px-1 text-xs text-zinc-500">{userLabel}</p>
            <Link
              href="/"
              className="mt-2 block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Back to site
            </Link>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
