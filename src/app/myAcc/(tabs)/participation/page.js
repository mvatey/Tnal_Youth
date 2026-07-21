"use client";

import { useMemo, useState } from "react";

import { getCurrentMember } from "@/lib/currentMember";
import participationData from "@/data/participation.json";

import DataTable from "@/components/table/DataTable";
import ButtonSeeDetail from "@/components/forms/ButtonSeeDetail";

const TYPE_STYLES = {
  កម្មវិធីផ្ទៃក្នុង: "bg-primary-light text-primary",
  កម្មវិធីខាងក្រៅ: "bg-success-bg text-success",
};

const STATUS_STYLES = {
  បានចូលរួម: "bg-success-bg text-success",
  មិនបានចូលរួម: "bg-error-bg text-error",
};

export default function MyAccountParticipationPage() {
  const member = getCurrentMember();

  const memberParticipation = useMemo(() => {
    if (!member) return [];

    return participationData.filter((item) => {
      if (item.memberId === undefined) return true;

      return String(item.memberId) === String(member.id);
    });
  }, [member]);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const types = useMemo(
    () => [
      ...new Set(
        memberParticipation
          .map((item) => item.type)
          .filter(Boolean),
      ),
    ],
    [memberParticipation],
  );

  const filteredData = useMemo(() => {
    const search = query.trim().toLowerCase();

    return memberParticipation.filter((item) => {
      const matchesSearch =
        !search ||
        item.activity?.toLowerCase().includes(search) ||
        item.sector?.toLowerCase().includes(search);

      const matchesType =
        !typeFilter || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [memberParticipation, query, typeFilter]);

  if (!member) {
    return <NotFound />;
  }

  const columns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
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
      accessor: "sector",
    },
    {
      header: "ប្រភេទ",
      width: "w-[14%]",
      align: "center",
      render: (item) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-[11px] ${
            TYPE_STYLES[item.type] ||
            "bg-gray-100 text-text-secondary"
          }`}
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
          className={`inline-flex rounded-full px-2 py-1 text-[11px] ${
            STATUS_STYLES[item.status] ||
            "bg-gray-100 text-text-secondary"
          }`}
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
        <div className="flex flex-col leading-tight">
          <span className="truncate">
            {item.location?.city || "-"}
          </span>
          <span className="truncate text-[11px] text-text-secondary">
            {item.location?.district || ""}
          </span>
        </div>
      ),
    },
    {
      header: "ថ្ងៃចូលរួម",
      width: "w-[14%]",
      align: "left",
      accessor: "date",
    },
    {
      header: "សកម្មភាព",
      width: "w-[8%]",
      align: "center",
      render: (item) => (
        <ButtonSeeDetail
          onClick={() =>
            console.log("Participation detail:", item)
          }
        />
      ),
    },
  ];

  return (
    <DataTable
      title="ប្រវត្តិការចូលរួមសកម្មភាព"
      data={filteredData}
      columns={columns}
      filters={[
        {
          name: "type",
          value: typeFilter,
          onChange: setTypeFilter,
          placeholder: "ប្រភេទ",
          options: types,
        },
      ]}
      searchQuery={query}
      onSearchChange={setQuery}
      searchPlaceholder="ស្វែងរក..."
      pageSize={10}
      downloadFilename={`participation-${member.id}.csv`}
    />
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <p className="text-sm text-red-500">
        រកមិនឃើញព័ត៌មានសមាជិក
      </p>
    </div>
  );
}