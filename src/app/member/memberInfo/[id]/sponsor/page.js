"use client";

import { useMemo, useState } from "react";

import DataTable from "@/components/table/DataTable";
import sponsorData from "@/data/sponsor.json";

export default function SponsorDonationPage() {
  const [sponsors] = useState(sponsorData);

  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

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