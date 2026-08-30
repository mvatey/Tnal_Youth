"use client";

import useCurrentMember from "@/hooks/useCurrentMember";
import { useLanguage } from "@/context/LanguageContext";

export default function MyAccountPage() {
  const { member, loading, error } = useCurrentMember();
  const { t, label } = useLanguage();

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-page-white p-6">
        {t("memberPage.loadingMember")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-bg-page-white p-6 text-error">
        {error}
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-border bg-bg-page-white p-6">
        {t("memberPage.memberNotFound")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-page-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-primary">
        {t("memberPage.detailPersonal")}
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs text-text-secondary">{t("memberPage.nameKm")}</p>
          <p className="font-medium text-text-primary">
            {member.name_kh || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">{t("memberPage.nameEn")}</p>
          <p className="font-medium text-text-primary">
            {member.name_en || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">{t("memberPage.phone")}</p>
          <p className="font-medium text-text-primary">
            {member.phone || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">{t("memberPage.email")}</p>
          <p className="font-medium text-text-primary">
            {member.email || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">{t("memberPage.branch")}</p>
          <p className="font-medium text-text-primary">
            {member.branch || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">{t("memberPage.gender")}</p>
          <p className="font-medium text-text-primary">
            {member.gender || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">{t("memberPage.nationality")}</p>
          <p className="font-medium text-text-primary">
            {label(member.nationality, "-")}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">{t("memberPage.ethnicity")}</p>
          <p className="font-medium text-text-primary">
            {label(member.ethnicity, "-")}
          </p>
        </div>
      </div>
    </div>
  );
}
