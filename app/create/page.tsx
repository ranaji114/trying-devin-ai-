import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CreateJourneyWizard } from "@/components/create/CreateJourneyWizard";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create Journey",
  description: "Document a trip: route, stops, story and photos.",
};

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/create");

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">Create Journey</h1>
      <p className="mt-2 text-sm text-muted">
        Document the route you actually travelled so the next traveler can follow it.
      </p>
      <div className="mt-10">
        <CreateJourneyWizard userId={user.id} />
      </div>
    </div>
  );
}
