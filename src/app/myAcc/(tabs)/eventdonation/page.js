"use client";

import { useEffect, useMemo, useState } from "react";

import DataTable from "@/components/table/DataTable";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";
import { useLanguage } from "@/context/LanguageContext";

// Same shape/endpoint donation/eventdonation/page.js already uses for a
// member-role viewer (GET /api/my-account/donations/events) -- this just
// gives it its own tab inside My Account instead of only being reachable
// through the separate Finance/Activity-donations nav path.
function mapMyEventRow(row, locale) {
  const activityTitle =
    locale === "en"
      ? row.activity?.titleEn || row.activity?.titleKm
      : row.activity?.titleKm || row.activity?.titleEn;

  const branchName =
    locale === "en"
      ? row.branch?.nameEn || row.branch?.nameKm
      : row.branch?.nameKm || row.branch?.nameEn;

  return {
    id: row.id,
    activityId: row.activity?.id ?? null,
    eventName: activityTitle || "-",
    branch: branchName || "-",
    date: row.paidAt ? new Date(row.paidAt).toLocaleDateString("en-GB") : "-",
    dateValue: row.paidAt ? row.paidAt.slice(0, 10) : "",
    rielAmount: Number(row.amountKhr || 0).toLocaleString(),
    dollarAmount: Number(row.amountUsd || row.totalAmountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    paymentMethod:
      locale === "en"
        ? row.paymentMethod?.labelEn || row.paymentMethod?.labelKm
        : row.paymentMethod?.labelKm || row.paymentMethod?.labelEn,
  };
}

export default function MyAccountEventDonationPage() {
  const { t, locale } = useLanguage();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDonations() {
      try {
        setIsLoading(true);
        setError("");

        const items = await fetchMyAccountCollection("donations/events");
        if (cancelled) return;

        // Same MEMBER view must show exactly ONE current row per activity
        // rule already applied on the Finance/Activity-donations page --
        // old/test duplicate donation rows can exist in the database, and
        // the API is ordered newest-first, so the first row wins.
        const oneRowPerActivity = new Map();
        for (const item of items) {
          const mapped = mapMyEventRow(item, locale);
          const key = mapped.activityId != null
            ? `activity:${mapped.activityId}`
            : `fallback:${mapped.eventName}|${mapped.branch}`;
          if (!oneRowPerActivity.has(key)) {
            oneRowPerActivity.set(key, mapped);
          }
        }

        setRows(Array.from(oneRowPerActivity.values()));
      } catch (loadError) {
        if (!cancelled) {
          setRows([]);
          setError(loadError.message || t("memberPage.loadDonationFailed"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDonations();
    return () => { cancelled = true; };
  }, [locale, t]);

  const filteredData = useMemo(() => {
    const search = query.trim().toLowerCase();

    return rows.filter((item) => {
      const haystack = [
        item.eventName,
        item.branch,
        item.date,
        item.rielAmount,
        item.dollarAmount,
        item.paymentMethod,
      ].map((value) => String(value ?? "").toLowerCase());

      return !search || haystack.some((value) => value.includes(search));
    });
  }, [rows, query]);

  const columns = [
    { header: t("memberPage.no"), width: "w-[6%]", align: "center", render: (_, index) => index },
    { header: t("memberPage.activityName"), width: "w-[26%]", align: "left", accessor: "eventName" },
    { header: t("memberPage.branch"), width: "w-[16%]", align: "left", accessor: "branch" },
    { header: t("memberPage.date"), width: "w-[16%]", align: "left", accessor: "date" },
    { header: t("donationPage.amountKhrPlain"), width: "w-[14%]", align: "left", accessor: "rielAmount" },
    { header: t("donationPage.amountUsdPlain"), width: "w-[14%]", align: "left", accessor: "dollarAmount" },
    { header: t("memberPage.paymentMethod"), width: "w-[16%]", align: "left", accessor: "paymentMethod" },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">{t("memberPage.eventDonationListTitle")}</h2>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-bg-page-white px-4 py-3 text-sm text-text-secondary">
          {t("common.loading")}
        </div>
      )}

      <DataTable
        data={filteredData}
        columns={columns}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder={t("memberPage.search")}
        pageSize={10}
        minTableWidth={760}
        emptyMessage={t("memberPage.noRecordsFound")}
        onDownload={() =>
          downloadTableAsExcel({
            data: filteredData,
            columns,
            fileName: t("memberPage.activityDonationFile"),
          })
        }
      />
    </div>
  );
}
