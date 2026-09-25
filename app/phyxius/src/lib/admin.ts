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
