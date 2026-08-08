"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import DataTable from "@/components/table/DataTable";
export default function SponsorDonationPage() {
  const { id } = useParams();
  const [sponsors, setSponsors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSponsorDonations() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `/api/backend/donations?memberId=${encodeURIComponent(id)}&page=0&size=100`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            payload.message || "មិនអាចទាញយកទិន្នន័យអ្នកឧបត្ថម្ភបានទេ។",
          );
        }

        const items = payload.data?.items || payload.items || [];
        setSponsors(
          items
            .filter((item) => item.typeCode === "SPONSOR_DONATION")
            .map((item) => {
              const period = item.donationPeriod
                ? new Date(`${item.donationPeriod}T00:00:00`)
                : item.paidAt
                  ? new Date(item.paidAt)
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
          setSponsors([]);
          setError(
            loadError.message || "មិនអាចទាញយកទិន្នន័យអ្នកឧបត្ថម្ភបានទេ។",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    if (id) loadSponsorDonations();
    return () => controller.abort();
  }, [id]);

  const paymentMethods = useMemo(() => {
    return [
      ...new Set(
        sponsors
          .map((item) => item.paymentMethod)
          .filter(Boolean),
      ),
    ];
  }, [sponsors]);

  const filteredData = useMemo(() => {
    const search = query.trim().toLowerCase();

    return sponsors.filter((item) => {
      const amount = String(item.amount ?? "").toLowerCase();
      const date = String(item.date ?? "").toLowerCase();
      const recordedBy = String(item.recordedBy ?? "").toLowerCase();
      const paymentMethod = String(
        item.paymentMethod ?? "",
      ).toLowerCase();

      const matchesQuery =
        !search ||
        amount.includes(search) ||
        date.includes(search) ||
        recordedBy.includes(search) ||
        paymentMethod.includes(search);

      const matchesMethod =
        !methodFilter ||
        item.paymentMethod === methodFilter;

      return matchesQuery && matchesMethod;
    });
  }, [sponsors, query, methodFilter]);

  const columns = [
    {
      header: "ល.រ",
      width: "w-[8%]",
      align: "center",
      render: (_, index) => index + 1,
    },
    {
      header: "ប្រចាំខែ",
      width: "w-[16%]",
      align: "left",
      render: (item) => (
        <span>
          {item.month}, {item.year}
        </span>
      ),
    },
    {
      header: "ចំនួន",
      width: "w-[20%]",
      align: "left",
      accessor: "amount",
    },
    {
      header: "ថ្ងៃបរិច្ឆេទ",
      width: "w-[22%]",
      align: "left",
      accessor: "date",
    },
    {
      header: "កត់ត្រាដោយ",
      width: "w-[24%]",
      align: "left",
      accessor: "recordedBy",
    },
    {
      header: "វិធីសាស្រ្តទូទាត់",
      width: "w-[26%]",
      align: "left",
      accessor: "paymentMethod",
    },
  ];

  const filters = [
    {
      name: "paymentMethod",
      value: methodFilter,
      onChange: setMethodFilter,
      options: paymentMethods.map((method) => ({
        label: method,
        value: method,
      })),
      placeholder: "វិធីសាស្រ្តទូទាត់",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">
        បញ្ជីវិភាគទានអ្នកឧបត្ថម្ភ
      </h2>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
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
        downloadFilename="sponsor-donation.csv"
      />
    </div>
  );
}
