import type { Metadata } from "next";
import { LookupTableManagement } from "@/components/admin/LookupTableManagement";
import { listLookups } from "@/lib/content-lookups";

export const metadata: Metadata = {
  title: "Tags — Content — Admin — MosiMosi",
};

export default async function ContentTagsPage() {
  const { items, error } = await listLookups("tags");

  return (
    <LookupTableManagement
      kind="tags"
      title="Tags"
      description="Shared labels linked to motions through motion_tags"
      singular="tag"
      items={items}
      loadError={error}
    />
  );
}
