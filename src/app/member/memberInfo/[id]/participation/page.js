// src/app/member/memberInfo/[id]/participation/page.js
"use client";

import { useMemo, useState } from "react";
import { Eye, List } from "lucide-react";
import participationData from "@/data/participation.json";
import DataTable from "@/components/table/DataTable.js";

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

  const filtered = useMemo(() => {
    return participationData.filter((item) => {
      const matchesQuery = item.activity
        ?.toLowerCase()
        .includes(query.toLowerCase());

      const matchesType = !typeFilter || item.type === typeFilter;

      return matchesQuery && matchesType;
    });
  }, [query, typeFilter]);

  const handleViewDetail = (item) => {
    console.log("View detail:", item);
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
      width: "w-[22%]",
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
          className={`inline-flex max-w-full items-center justify-center rounded-full px-2 py-1 text-[11px] whitespace-nowrap truncate ${TYPE_BADGE_STYLES[item.type] || "bg-gray-100 text-text-secondary"}`}
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
          className={`inline-flex max-w-full items-center justify-center rounded-full px-2 py-1 text-[11px] whitespace-nowrap truncate ${STATUS_BADGE_STYLES[item.status] || "bg-gray-100 text-text-secondary"}`}
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
        <span className="block truncate">
          {item.location?.city} {item.location?.district}
        </span>
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
    <button
      onClick={() => handleViewDetail(item)}
      className="
        inline-flex 
        items-center 
        justify-center 
        gap-1.5
        rounded-xl 
        bg-secondary 
        px-3
        py-1.5
        text-xs 
        font-medium 
        text-white 
        hover:opacity-90 
        transition
        whitespace-nowrap
      "
    >
      <List className="h-3.5 w-3.5 shrink-0" />
      <span>លម្អិត</span>
    </button>
  ),
}
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
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          ប្រវត្តិការចូលរួមសកម្មភាព
        </h2>
      </div>

      <DataTable
        data={filtered}
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
