"use client";

import { PlusCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AddDonationLink() {
  const router = useRouter();
  const pathname = usePathname();
  const { member, loading } = useCurrentMember();
  const { t } = useLanguage();
  const { isAllBranchesView = false } = useBranch();
  const effectiveRole = member?.effectiveRole || member?.role;
  const canSeeAddDonation = ["secretary", "branch_leader"].includes(
    effectiveRole,
  );
  const isReadOnlyViewer = Boolean(member?.isViewer);

  // Donations can only be added inside the country-level staff's own
  // branch, not while viewing "all branches".
  if (loading || !canSeeAddDonation || isAllBranchesView) return null;

  const addPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/add"
    : "/donation/add";

  return (
    <button
      type="button"
      onClick={() => {
        if (!isReadOnlyViewer) router.push(addPath);
      }}
      disabled={isReadOnlyViewer}
      title={isReadOnlyViewer ? t("common.viewerReadOnly") : undefined}
      className={`inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-lg bg-success px-4 text-xs font-medium text-white shadow-sm transition sm:w-auto ${
        isReadOnlyViewer
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-emerald-700"
      }`}
    >
      <PlusCircle size={17} />
      {t("donationPage.addDonation")}
    </button>
  );
}
