// src/app/member/memberInfo/[id]/participation/page.js
"use client";

import { useMemo, useState } from "react";
import participationData from "@/data/participation.json";
import DataTable from "@/components/table/DataTable.js";
import ButtonSeeDetail from "@/components/forms/ButtonSeeDetail.js";

const TYPE_BADGE_STYLES = {
  កម្មវិធីផ្ទៃក្នុង: "bg-primary-light text-primary",
  កម្មវិធីខាងក្រៅ: "bg-success-bg text-success",
};

const STATUS_BADGE_STYLES = {
  បានចូលរួម: "bg-success-bg text-success",
  មិនបានចូលរួម: "bg-error-bg text-error",
};

export default function ParticipationPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const types = useMemo(() => {
    return [...new Set(participationData.map((item) => item.type))];
  }, []);

  const filteredData = useMemo(() => {
    return participationData.filter((item) => {
      const search = query.trim().toLowerCase();
      const matchesQuery =
        !search || item.activity?.toLowerCase().includes(search);
      const matchesType = !typeFilter || item.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [query, typeFilter]);

  const handleViewDetail = (item) => {
    console.log("View activity detail:", item);
  };

  const columns = [
    {
      header: "ល.រ",
      width: "w-[5%]",
      align: "center",
      render: (_, index) => index,
    },
    {
      header: "ឈ្មោះកម្មវិធី",
      width: "w-[21%]",
      align: "left",
      render: (item) => (
        <span className="block truncate font-medium text-text-primary">
          {item.activity}
        </span>
      ),
    },
    {
      header: "វិស័យ",
      width: "w-[11%]",
      align: "left",
      render: (item) => <span className="block truncate">{item.sector}</span>,
    },
    {
      header: "ប្រភេទ",
      width: "w-[14%]",
      align: "center",
      render: (item) => (
        <span
          className={`inline-flex max-w-full items-center justify-center truncate whitespace-nowrap rounded-full px-2 py-1 text-[11px] ${TYPE_BADGE_STYLES[item.type] || "bg-gray-100 text-text-secondary"}`}
        >
          {item.type}
        </span>
      ),
    },
    {
      header: "ការចូលរួម",
      width: "w-[13%]",
      align: "center",
      render: (item) => (
        <span
          className={`inline-flex max-w-full items-center justify-center truncate whitespace-nowrap rounded-full px-2 py-1 text-[11px] ${STATUS_BADGE_STYLES[item.status] || "bg-gray-100 text-text-secondary"}`}
        >
          {item.status}
        </span>
      ),
    },
    {
  header: "ទីតាំង",
  width: "w-[14%]",
  align: "left",
  render: (item) => (
    <div className="flex flex-col leading-4">
      <span className="text-xs font-medium truncate">
        {item.location?.city}
      </span>
      <span className="text-[11px] text-text-secondary truncate">
        {item.location?.district}
      </span>
    </div>
  ),
},
    {
      header: "ថ្ងៃចូលរួម",
      width: "w-[14%]",
      align: "left",
      render: (item) => <span className="block truncate">{item.date}</span>,
    },
    {
      header: "សកម្មភាព",
      width: "w-[8%]",
      align: "center",
      render: (item) => (
        <ButtonSeeDetail onClick={() => handleViewDetail(item)} />
      ),
    },
  ];

  const filters = [
    {
      value: typeFilter,
      onChange: setTypeFilter,
      options: types,
      placeholder: "ប្រភេទ",
    },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-text-primary">
        ប្រវត្តិការចូលរួមសកម្មភាព
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
