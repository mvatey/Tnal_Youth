// src/app/member/memberInfo/[id]/participation/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const { id } = useParams();
  const router = useRouter();
  const [participations, setParticipations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const types = useMemo(() => {
    return [...new Set(participations.map((item) => item.type).filter(Boolean))];
  }, [participations]);

  useEffect(() => {
    let cancelled = false;

    async function loadParticipations() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/backend/members/${encodeURIComponent(id)}/participations?page=0&size=100`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load participation history.");
        }
        const page = await response.json();
        if (!cancelled) {
          setParticipations((page.content || []).map((item) => ({
            id: item.id,
            activityId: item.activity_id,
            activity: item.activity_title_km || item.activity_title_en || "-",
            sector: item.sector?.label_km || item.sector?.label_en || "-",
            type: item.type?.label_km || item.type?.label_en || item.type?.code || "-",
            status:
              item.attendance_status?.label_km ||
              item.attendance_status?.label_en ||
              item.attendance_status?.code ||
              "-",
            location: {
              city: item.location?.name || "-",
              district: item.location?.address || "",
            },
            date: item.starts_at ? new Date(item.starts_at).toLocaleDateString("km-KH") : "-",
          })));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load participation history.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadParticipations();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const filteredData = useMemo(() => {
    return participations.filter((item) => {
      const search = query.trim().toLowerCase();
      const matchesQuery =
        !search || item.activity?.toLowerCase().includes(search);
      const matchesType = !typeFilter || item.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [participations, query, typeFilter]);

  const handleViewDetail = (item) => {
    router.push(`/activity/${item.activityId}`);
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

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {isLoading && <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-500">Loading participation history...</div>}

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
