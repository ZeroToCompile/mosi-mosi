import type { Metadata } from "next";
import { LookupTableManagement } from "@/components/admin/LookupTableManagement";
import { listLookups } from "@/lib/content-lookups";

export const metadata: Metadata = {
  title: "Themes — Content — Admin — MosiMosi",
};

export default async function ContentThemesPage() {
  const { items, error } = await listLookups("themes");

  return (
    <LookupTableManagement
      kind="themes"
      title="Themes"
      description="Topic themes motions reference by foreign key"
      singular="theme"
      items={items}
      loadError={error}
      deleteBlockedWhenUsed
    />
  );
}
