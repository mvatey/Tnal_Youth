"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import DataTable from "@/components/table/DataTable";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import {
  fetchAllDonationRecords,
  filterOwnDonationType,
  mapDonationRecord,
} from "@/lib/memberDonationRecords";
import { useLanguage } from "@/context/LanguageContext";

export default function DonationRecordsPage() {
  const { t, label } = useLanguage();
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [query, setQuery] = useState("");
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

        /*
         * IMPORTANT: the list is always first restricted by member_id on
         * the backend, then by the exact donation type here. We never pull
         * the whole branch/activity donor list into a member profile.
         */
        setRows(
          filterOwnDonationType(allItems, "SPONSOR_DONATION")
            .map(mapDonationRecord),
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
  }, [id]);

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
        item.month,
        item.year,
        item.amount,
        item.date,
        item.recordedBy,
        item.paymentMethod,
      ].map((value) => String(value ?? "").toLowerCase());

      const matchesQuery = !search || haystack.some((value) => value.includes(search));
      const matchesMethod = !methodFilter || item.paymentMethod === methodFilter;
      return matchesQuery && matchesMethod;
    });
  }, [rows, query, methodFilter]);

  const columns = [
    { header: t("memberPage.no"), width: "w-[7%]", align: "center", render: (_, index) => index },
    {
      header: t("memberPage.month"),
      width: "w-[18%]",
      align: "left",
      render: (item) => <span>{item.month}, {item.year}</span>,
    },
    { header: t("memberPage.amount"), width: "w-[16%]", align: "left", accessor: "amount" },
    { header: t("memberPage.date"), width: "w-[19%]", align: "left", accessor: "date" },
    { header: t("memberPage.recordedBy"), width: "w-[20%]", align: "left", accessor: "recordedBy" },
    { header: t("memberPage.paymentMethod"), width: "w-[20%]", align: "left", accessor: "paymentMethod" },
  ];

  const filters = [
    {
      name: "paymentMethod",
      value: methodFilter,
      onChange: setMethodFilter,
      options: paymentMethods,
      placeholder: t("memberPage.paymentMethod"),
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">{t("memberPage.sponsorListTitle")}</h2>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-bg-page-white px-4 py-3 text-sm text-text-secondary">
          {t("branchPage.loadingData")}
        </div>
      )}

      <DataTable
        data={filteredData}
        columns={columns}
        filters={filters}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder={t("memberPage.search")}
        pageSize={10}
        minTableWidth={560}
        onDownload={() =>
          downloadTableAsExcel({
            data: filteredData,
            columns,
            fileName: t("memberPage.sponsorDonationFile"),
          })
        }
      />
    </div>
  );
}
