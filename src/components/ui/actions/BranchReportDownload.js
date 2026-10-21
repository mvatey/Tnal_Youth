"use client";

import { useMemo, useState } from "react";
import { RiFileWord2Line } from "react-icons/ri";

import ReportDownloadButton from "@/components/ui/actions/ReportDownloadButton";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getEffectiveRole } from "@/lib/navigation";

/*
 * The branch summary report (Word, filled into the association's template):
 * a year picker -- the current year unless changed -- and the button. What
 * the file holds (the branch's own report, the regional one, or both) is
 * decided by the backend from the branch's level and who is asking.
 */
export default function BranchReportDownload({ branchId }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const years = useMemo(
    () => Array.from({ length: 7 }, (_, index) => currentYear - index),
    [currentYear],
  );

  // Only administrators, branch leaders and secretaries (a viewer counts as
  // the role it is scoped to) -- the backend enforces the same.
  const allowed = ["admin", "secretary", "branch_leader"].includes(
    getEffectiveRole(user),
  );

  if (!branchId || !allowed) return null;

  return (
    <div className="flex items-center gap-2">
      <select
        value={year}
        onChange={(event) => setYear(Number(event.target.value))}
        aria-label={t("branchPage.reportYear")}
        className="h-[34px] rounded-lg border border-border bg-bg-page-white px-3 text-xs font-medium text-text-secondary outline-none focus:border-primary"
      >
        {years.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ReportDownloadButton
        path={`reports/branch-report?branchId=${encodeURIComponent(branchId)}&year=${year}`}
        label={t("branchPage.downloadReport")}
        fallbackFileName="branch-report.docx"
        Icon={RiFileWord2Line}
      />
    </div>
  );
}
