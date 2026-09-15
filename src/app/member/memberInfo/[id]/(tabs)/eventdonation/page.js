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
import { formatDateWithMonth } from "@/lib/formatDate";

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
    date: formatDateWithMonth(row.paidAt, locale),
    rielAmount: Number(row.amountKhr || 0).toLocaleString(),
    // The actual USD portion donated -- amountUsd is legitimately 0 for a
    // donation paid entirely in Riel; row.totalAmountUsd is the whole
    // donation converted to USD for grand-total purposes and doesn't
    // belong in this column.
    dollarAmount: Number(row.amountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    paymentMethod:
      locale === "en"
        ? row.paymentMethodLabelEn || row.paymentMethodLabelKm || row.paymentMethodCode
        : row.paymentMethodLabelKm || row.paymentMethodLabelEn || row.paymentMethodCode,
  };
}

export default function MemberEventDonationPage() {
  const { t, label, locale } = useLanguage();
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [methodFilter, setMethodFilter] = useState("");

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

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/lookups/payment-methods?activeOnly=true&includeMaterial=true", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || t("memberPage.loadPaymentMethodsFailed"));
        const methods = Array.isArray(body) ? body : (body?.data || []);
        setPaymentMethods(
          methods
            .map((method) => ({
              label: label(method, method.code),
              value: label(method, method.code),
            }))
            .filter((method) => method.value),
        );
      })
      .catch((lookupError) => {
        if (lookupError.name !== "AbortError") console.error("Cannot load payment methods:", lookupError);
      });

    return () => controller.abort();
  }, [label, t]);

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

      const matchesQuery = !search || haystack.some((value) => value.includes(search));
      const matchesMethod = !methodFilter || item.paymentMethod === methodFilter;
      return matchesQuery && matchesMethod;
    });
  }, [rows, query, methodFilter]);

  const filters = [
    {
      name: "paymentMethod",
      value: methodFilter,
      onChange: setMethodFilter,
      options: paymentMethods,
      placeholder: t("memberPage.paymentMethod"),
    },
  ];

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

      <DataTable
        data={filteredData}
        loading={isLoading}
        columns={columns}
        filters={filters}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder={t("memberPage.search")}
        pageSize={10}
        minTableWidth={760}
        emptyMessage={t("memberPage.noRecordsFound")}
        loadingMessage={t("common.loading")}
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
