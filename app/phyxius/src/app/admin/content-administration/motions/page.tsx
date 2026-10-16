import type { Metadata } from "next";
import { MotionsManagement } from "@/components/admin/MotionsManagement";
import { listLookups } from "@/lib/content-lookups";
import { listMotions } from "@/lib/motions";
import { listTournaments } from "@/lib/tournaments";

export const metadata: Metadata = {
  title: "Motions — Content — Admin — MosiMosi",
};

export default async function ContentMotionsPage() {
  const [motions, themes, tags, tournaments] = await Promise.all([
    listMotions(),
    listLookups("themes"),
    listLookups("tags"),
    listTournaments(),
  ]);

  const loadError =
    motions.error || themes.error || tags.error || tournaments.error;

  return (
    <MotionsManagement
      items={motions.items}
      themes={themes.items.map((item) => ({ id: item.id, name: item.name }))}
      tags={tags.items.map((item) => ({ id: item.id, name: item.name }))}
      tournamentNames={tournaments.items.map((item) => item.name)}
      loadError={loadError}
    />
  );
}
