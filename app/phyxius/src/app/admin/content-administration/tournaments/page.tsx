import type { Metadata } from "next";
import { TournamentsManagement } from "@/components/admin/TournamentsManagement";
import { listTournaments } from "@/lib/tournaments";

export const metadata: Metadata = {
  title: "Tournaments — Content — Admin — MosiMosi",
};

export default async function ContentTournamentsPage() {
  const { items, error } = await listTournaments();

  return <TournamentsManagement items={items} loadError={error} />;
}
