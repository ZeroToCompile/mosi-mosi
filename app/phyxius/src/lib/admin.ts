export function hasAdminRole(role: string | null | undefined) {
  if (!role) return false;
  return role
    .split(",")
    .map((part) => part.trim())
    .includes("admin");
}

export const adminNavItems = [
  { href: "/admin/users", label: "Users", description: "Accounts & roles" },
  { href: "/admin/groups", label: "Groups", description: "Team groupings" },
  {
    href: "/admin/permissions",
    label: "Permissions",
    description: "Access rules",
  },
  { href: "/admin/sessions", label: "Sessions", description: "Active logins" },
  { href: "/admin/settings", label: "Settings", description: "Admin config" },
] as const;

export const contentAdminNavItems: ReadonlyArray<{
  href: string;
  label: string;
  description: string;
  exact?: boolean;
}> = [
  {
    href: "/admin/content-administration",
    label: "Overview",
    description: "Content home",
    exact: true,
  },
  {
    href: "/admin/content-administration/motions",
    label: "Motions",
    description: "Debate motions",
  },
  {
    href: "/admin/content-administration/themes",
    label: "Themes",
    description: "Topic themes",
  },
  {
    href: "/admin/content-administration/tournaments",
    label: "Tournaments",
    description: "Event sources",
  },
  {
    href: "/admin/content-administration/tags",
    label: "Tags",
    description: "Shared labels",
  },
];
