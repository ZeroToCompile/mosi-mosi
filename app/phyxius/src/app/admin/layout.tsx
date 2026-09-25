import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { hasAdminRole } from "@/lib/admin";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!hasAdminRole(session.user.role)) {
    redirect("/");
  }

  return (
    <AdminShell userLabel={session.user.name || session.user.email}>
      {children}
    </AdminShell>
  );
}
