"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import DataTable from "@/components/table/DataTable.js";
import { downloadTableAsExcel } from "@/utils/downloadExcel";

export default function DonationPage() {
  const { id } = useParams();
  const [donations, setDonations] = useState([]);
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

        const items = [];
        let page = 0;
        let total = Number.POSITIVE_INFINITY;

        while (items.length < total) {
          const response = await fetch(
            `/api/backend/donations?memberId=${encodeURIComponent(id)}&page=${page}&size=100`,
            { cache: "no-store", signal: controller.signal },
          );
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(payload.message || "Unable to load monthly donations.");
          }

          const pageData = payload.data || payload;
          const pageItems = Array.isArray(pageData.items) ? pageData.items : [];
          items.push(...pageItems);
          total = Number.isFinite(Number(pageData.total)) ? Number(pageData.total) : items.length;
          if (pageItems.length === 0) break;
          page += 1;
        }
        setDonations(
          items
            .filter((item) => item.typeCode === "MONTHLY_DONATION")
            .map((item) => {
              const period = item.donationPeriod
                ? new Date(`${item.donationPeriod}T00:00:00`)
                : null;
              const amounts = [];

              if (Number(item.amountUsd)) {
                amounts.push(`$${Number(item.amountUsd).toFixed(2)}`);
              }
              if (Number(item.amountKhr)) {
                amounts.push(`${Number(item.amountKhr).toLocaleString()} ៛`);
              }

              return {
                id: item.id,
                month: period
                  ? period.toLocaleString("km-KH", { month: "long" })
                  : "-",
                year: period?.getFullYear() || "-",
                amount: amounts.join(" / ") || "$0.00",
                date: item.paidAt
                  ? new Date(item.paidAt).toLocaleDateString("km-KH")
                  : "-",
                recordedBy: item.recordedByName || "-",
                paymentMethod:
                  item.paymentMethodLabelKm ||
                  item.paymentMethodLabelEn ||
                  item.paymentMethodCode ||
                  "-",
              };
            }),
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setDonations([]);
          setError(
            loadError.message || "មិនអាចទាញយកទិន្នន័យវិភាគទានបានទេ។",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    if (id) loadDonations();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/lookups/payment-methods?activeOnly=true&includeMaterial=false", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || "Unable to load payment methods.");
        const rows = Array.isArray(body) ? body : (body?.data || []);
        setPaymentMethods(rows.map((method) => ({
          label: method.label_km || method.labelKm || method.label_en || method.labelEn || method.code,
          value: method.label_km || method.labelKm || method.label_en || method.labelEn || method.code,
        })).filter((method) => method.value));
      })
      .catch((lookupError) => {
        if (lookupError.name !== "AbortError") console.error("Cannot load payment methods:", lookupError);
      });
    return () => controller.abort();
  }, []);

  const filteredData = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return donations.filter((item) => {
      const month = String(
        item.month ?? "",
      ).toLowerCase();

      const year = String(
        item.year ?? "",
      ).toLowerCase();

      const amount = String(
        item.amount ?? "",
      ).toLowerCase();

      const recordedBy = String(
        item.recordedBy ?? "",
      ).toLowerCase();

      const paymentMethod = String(
        item.paymentMethod ?? "",
      ).toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        month.includes(normalizedQuery) ||
        year.includes(normalizedQuery) ||
        amount.includes(normalizedQuery) ||
        recordedBy.includes(normalizedQuery) ||
        paymentMethod.includes(normalizedQuery);

      const matchesMethod =
        !methodFilter ||
        item.paymentMethod === methodFilter;

      return matchesQuery && matchesMethod;
    });
  }, [
    donations,
    query,
    methodFilter,
  ]);

  const columns = [
    {
      header: "ល.រ",
      width: "w-[7%]",
      align: "center",
      render: (_, index) => index + 1,
    },
    {
      header: "ប្រចាំខែ",
      width: "w-[18%]",
      align: "left",
      render: (item) => (
        <span>
          {item.month}, {item.year}
        </span>
      ),
    },
    {
      header: "ចំនួន",
      width: "w-[16%]",
      align: "left",
      accessor: "amount",
    },
    {
      header: "ថ្ងៃបរិច្ឆេទ",
      width: "w-[19%]",
      align: "left",
      accessor: "date",
    },
    {
      header: "កត់ត្រាដោយ",
      width: "w-[20%]",
      align: "left",
      accessor: "recordedBy",
    },
    {
      header: "វិធីសាស្រ្តទូទាត់",
      width: "w-[20%]",
      align: "left",
      accessor: "paymentMethod",
    },
  ];

  const filters = [
    {
      name: "paymentMethod",
      value: methodFilter,
      onChange: setMethodFilter,
      options: paymentMethods,
      placeholder: "វិធីសាស្រ្តទូទាត់",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">
        បញ្ជីការធ្វើវិភាគទាន
      </h2>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-bg-page-white px-4 py-3 text-sm text-text-secondary">
          កំពុងទាញយកទិន្នន័យ...
        </div>
      )}

      <DataTable
        data={filteredData}
        columns={columns}
        filters={filters}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="ស្វែងរក..."
        pageSize={10}
        onDownload={() =>
          downloadTableAsExcel({
            data: filteredData,
            columns,
            fileName: `វិភាគទានប្រចាំខែ-សមាជិក-${id}`,
          })
        }
      />
    </div>
  );
}
