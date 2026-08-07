"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import DataTable from "@/components/table/DataTable.js";

export default function DonationPage() {
  const { id } = useParams();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");

  const [methodFilter, setMethodFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDonations() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/backend/donations?memberId=${encodeURIComponent(id)}&page=0&size=100`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load donations.");
        }
        const payload = await response.json();
        const items = payload.data?.items || payload.items || [];
        if (!cancelled) {
          setDonations(items.filter((item) => item.typeCode !== "SPONSOR_DONATION").map((item) => {
            const period = item.donationPeriod ? new Date(`${item.donationPeriod}T00:00:00`) : null;
            const amountParts = [];
            if (Number(item.amountUsd)) amountParts.push(`$${Number(item.amountUsd).toFixed(2)}`);
            if (Number(item.amountKhr)) amountParts.push(`${Number(item.amountKhr).toLocaleString()} ៛`);
            return {
              id: item.id,
              month: period ? period.toLocaleString("km-KH", { month: "long" }) : "-",
              year: period?.getFullYear() || "-",
              amount: amountParts.join(" / ") || "$0.00",
              date: item.paidAt ? new Date(item.paidAt).toLocaleDateString("km-KH") : "-",
              recordedBy: item.recordedByName || "-",
              paymentMethod: item.paymentMethodLabelKm || item.paymentMethodLabelEn || item.paymentMethodCode || "-",
            };
          }));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load donations.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDonations();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const paymentMethods = useMemo(() => {
    return [
      ...new Set(
        donations
          .map((item) => item.paymentMethod)
          .filter(Boolean),
      ),
    ];
  }, [donations]);

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
      options: paymentMethods.map(
        (method) => ({
          label: method,
          value: method,
        }),
      ),
      placeholder: "វិធីសាស្រ្តទូទាត់",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">
        បញ្ជីការធ្វើវិភាគទាន
      </h2>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {isLoading && <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-500">Loading donations...</div>}

      <DataTable
        data={filteredData}
        columns={columns}
        filters={filters}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="ស្វែងរក..."
        pageSize={10}
      />
    </div>
  );
}
