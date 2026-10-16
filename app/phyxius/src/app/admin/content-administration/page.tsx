import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content administration — Admin — MosiMosi",
};

const sections = [
  {
    href: "/admin/content-administration/motions",
    label: "Motions",
    description: "Browse and manage debate motions in the Motion Bank.",
  },
  {
    href: "/admin/content-administration/themes",
    label: "Themes",
    description: "Topic themes motions can be filed under.",
  },
  {
    href: "/admin/content-administration/tournaments",
    label: "Tournaments",
    description: "Tournament sources such as WUDC, EUDC, and WSDC.",
  },
  {
    href: "/admin/content-administration/tags",
    label: "Tags",
    description: "Shared labels attached to motions across the catalogue.",
  },
] as const;

export default function ContentAdministrationPage() {
  return (
    <div className="flex-1 pl-6 pr-6 pt-6 sm:pl-8 lg:pl-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          Content administration
        </h1>
        <p className="mt-1 max-w-xl text-sm text-zinc-500">
          Manage Motion Bank catalogue data: motions and the themes,
          tournaments, and tags they reference.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="block h-full rounded-md border border-zinc-200 px-4 py-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              <span className="block text-sm font-semibold text-zinc-900">
                {section.label}
              </span>
              <span className="mt-1 block text-sm text-zinc-500">
                {section.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
