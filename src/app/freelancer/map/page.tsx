import { KanagawaCrematoriumMap } from "@/components/ceremo/kanagawa-map";
import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { requireRole } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function FreelancerMapPage() {
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  return (
    <FreelancerShell
      title="火葬場マップ"
      backHref="/freelancer"
      email={profile.email}
    >
      <KanagawaCrematoriumMap
        role="freelancer"
        homeHref="/freelancer"
      />
    </FreelancerShell>
  );
}
