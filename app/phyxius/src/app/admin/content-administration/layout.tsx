import { redirect } from "next/navigation";
import { ContentAdminShell } from "@/components/admin/ContentAdminShell";
import { getSession } from "@/lib/session";

export default async function ContentAdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <ContentAdminShell userLabel={session.user.name || session.user.email}>
      {children}
    </ContentAdminShell>
  );
}
