"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import DataTable from "@/components/table/DataTable";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import {
  fetchAllDonationRecords,
  filterOwnDonationType,
} from "@/lib/memberDonationRecords";
import { useLanguage } from "@/context/LanguageContext";

function mapEventDonationRow(row, locale) {
  const activityTitle =
    locale === "en"
      ? row.activityTitleEn || row.activityTitle
      : row.activityTitle || row.activityTitleEn;

  const branchName =
    locale === "en"
      ? row.branchNameEn || row.branchName
      : row.branchName || row.branchNameEn;

  return {
    id: row.id,
    eventName: activityTitle || "-",
    branch: branchName || "-",
    date: row.paidAt ? new Date(row.paidAt).toLocaleDateString("en-GB") : "-",
    rielAmount: Number(row.amountKhr || 0).toLocaleString(),
    dollarAmount: Number(row.amountUsd || row.totalAmountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    paymentMethod:
      locale === "en"
        ? row.paymentMethodLabelEn || row.paymentMethodLabelKm || row.paymentMethodCode
        : row.paymentMethodLabelKm || row.paymentMethodLabelEn || row.paymentMethodCode,
  };
}

export default function MemberEventDonationPage() {
  const { t, locale } = useLanguage();
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDonations() {
      try {
        setIsLoading(true);
        setError("");

        const allItems = await fetchAllDonationRecords(
          `/api/backend/donations?memberId=${encodeURIComponent(id)}`,
          controller.signal,
        );

        setRows(
          filterOwnDonationType(allItems, "ACTIVITY_DONATION")
            .map((item) => mapEventDonationRow(item, locale)),
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setRows([]);
          setError(loadError.message || t("memberPage.loadDonationFailed"));
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    if (id) loadDonations();
    return () => controller.abort();
  }, [id, locale, t]);

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
