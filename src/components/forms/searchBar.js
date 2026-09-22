import { Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DonationSearchInput({ value, onChange, showLabel = true }) {
  const { t } = useLanguage();
  return (
    <label className="block w-full min-w-0 sm:ml-auto sm:w-[260px]">
      {showLabel && (
        <span className="mb-1 block text-[12px] font-medium text-text-secondary">{t("memberPage.search")}</span>
      )}
      <span className="flex h-[34px] min-w-0 items-center gap-2 rounded-lg border border-border bg-bg-page-white px-3">
        <Search size={16} className="shrink-0 text-text-secondary" />
        <input
        className="min-w-0 flex-1 bg-transparent text-[12px] font-medium outline-none focus:placeholder-transparent"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("common.searchMemberPlaceholder")}
        />
      </span>
    </label>
  );
}
