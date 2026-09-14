import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { FacilitiesBrowser } from "@/app/funeral-company/facilities/facilities-browser";
import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";
import { createClient } from "@/lib/supabase/server";

export default async function FacilitiesPage() {
  const { profile } = await requireFuneralCompany();
  const supabase = await createClient();

  const [{ data: facilities, error: facilitiesError }, { data: municipalities, error: municipalityError }] =
    await Promise.all([
      supabase
        .from("crematoriums")
        .select(
          "id, name, address, notes, is_placeholder, data_label, municipality_id",
        )
        .order("sort_order"),
      supabase.from("municipalities").select("id, name").order("code"),
    ]);

  const municipalityNameById = new Map(
    (municipalities ?? []).map((item) => [item.id, item.name]),
  );

  const loadError = facilitiesError || municipalityError;

  return (
    <FuneralCompanyShell
      title="火葬場一覧"
      backHref="/funeral-company"
      email={profile.email}
    >
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-funeral">
          火葬場を選択
        </h1>
        <p className="text-base text-muted-foreground">
          神奈川県内の施設です。掲載内容は仮データで、実在施設の写真・電話番号は含みません。
        </p>
      </div>

      {loadError ? (
        <ScreenState title="取得に失敗しました">
          火葬場一覧を表示できませんでした。時間をおいて再度お試しください。
        </ScreenState>
      ) : (
        <FacilitiesBrowser
          facilities={(facilities ?? []).map((facility) => ({
            id: facility.id,
            name: facility.name,
            address: facility.address,
            municipalityName:
              municipalityNameById.get(facility.municipality_id) ?? "",
            municipalityId: facility.municipality_id,
            isPlaceholder: facility.is_placeholder,
            dataLabel: facility.data_label,
          }))}
          municipalities={municipalities ?? []}
        />
      )}
    </FuneralCompanyShell>
  );
}
