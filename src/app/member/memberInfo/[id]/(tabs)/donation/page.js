"use client";

import { useMemo, useState } from "react";

import DataTable from "@/components/table/DataTable.js";

import donationData from "@/data/donation.json";

export default function DonationPage() {
  const [donations] = useState(donationData);

  const [query, setQuery] = useState("");

  const [methodFilter, setMethodFilter] = useState("");

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