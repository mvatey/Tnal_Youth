"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileText } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import DataTable from "@/components/table/DataTable";
import CompanyDocumentPreview from "@/components/document/CompanyDocumentPreview";

const DOCUMENT_TYPE_BADGE_STYLES = {
  PDF: "bg-red-100 text-red-500",
  Excel: "bg-success-bg text-success",
  XLS: "bg-success-bg text-success",
  XLSX: "bg-success-bg text-success",
  Word: "bg-blue-50 text-blue-600",
  DOC: "bg-blue-50 text-blue-600",
  DOCX: "bg-blue-50 text-blue-600",
  PowerPoint: "bg-orange-50 text-orange-600",
  PPT: "bg-orange-50 text-orange-600",
  PPTX: "bg-orange-50 text-orange-600",
  PNG: "bg-purple-50 text-purple-600",
  JPG: "bg-yellow-50 text-yellow-600",
  JPEG: "bg-yellow-50 text-yellow-600",
};

const DEFAULT_DOCUMENT_TYPE_STYLE = "bg-gray-100 text-text-secondary";

export default function MemberDocumentPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/backend/documents", { cache: "no-store" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Unable to load documents.");
      const rows = body?.data ?? body;
      setDocuments((Array.isArray(rows) ? rows : []).filter((row) => row.member).map(mapMemberDocument));
    } catch (loadError) {
      setError(loadError.message || "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const filteredDocuments = documents.filter((item) => {
    const searchValue = search.trim().toLowerCase();

    const matchSearch =
      item.title?.toLowerCase().includes(searchValue) ||
      item.memberName?.toLowerCase().includes(searchValue);

    const matchType = !typeFilter || item.type === typeFilter;

    const matchDate = !dateFilter || item.date === dateFilter;

    return matchSearch && matchType && matchDate;
  });

  const columns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
      align: "center",
      render: (_, index) => index,
    },
    {
      header: "ឯកសារ",
      width: "w-[8%]",
      render: (item) =>
        item.isImage ? (
          <img
            src={item.image || "/document.jpg"}
            alt={item.title || "document"}
            className="h-8 w-6 rounded border border-gray-200 object-cover"
          />
        ) : (
          <span className="inline-flex h-8 w-7 items-center justify-center rounded border border-gray-200 bg-gray-50">
            <FileText size={18} className="text-text-secondary" />
          </span>
        ),
    },
    {
      header: "ឈ្មោះឯកសារ",
      accessor: "title",
      width: "w-[19%]",
    },
    {
      header: "សមាជិក",
      accessor: "memberName",
      width: "w-[15%]",
    },
    {
      header: "ភេទ",
      accessor: "gender",
      width: "w-[8%]",
    },
    {
      header: "សាខា",
      accessor: "branch",
      width: "w-[14%]",
    },
    {
      header: "កាលបរិច្ឆេទ",
      accessor: "date",
      width: "w-[12%]",
    },
    {
      header: "ទំហំ",
      accessor: "size",
      width: "w-[8%]",
    },
    {
      header: "ប្រភេទឯកសារ",
      width: "w-[10%]",
      align: "center",
      render: (item) => {
        const normalizedType = String(item.type || "").trim();

        const badgeStyle =
          DOCUMENT_TYPE_BADGE_STYLES[normalizedType] ||
          DEFAULT_DOCUMENT_TYPE_STYLE;

        return (
          <span
            className={`
              inline-flex
          max-w-full
          items-center
          justify-center
          rounded-full
          px-2
          py-1
          text-[11px]
          truncate whitespace-nowrap
              ${badgeStyle}
            `}
          >
            {normalizedType || "-"}
          </span>
        );
      },
    },
    {
      header: "សកម្មភាព",
      width: "w-[8%]",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedCertificate(item)}
            className="
              inline-flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              transition
              hover:bg-blue-50
            "
            aria-label="មើលឯកសារ"
          >
            <Eye size={18} className="text-blue-500" />
          </button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      name: "type",
      placeholder: "ប្រភេទឯកសារ",
      value: typeFilter,
      options: [
        ...new Set(documents.map((item) => item.type).filter(Boolean)),
      ].map((type) => ({
        label: type,
        value: type,
      })),
      onChange: setTypeFilter,
    },
    {
      name: "date",
      type: "date",
      placeholder: "ថ្ងៃ/ខែ/ឆ្នាំ",
      value: dateFilter,
      onChange: setDateFilter,
    },
  ];

  const addButton = (
    <button
      type="button"
      onClick={() => router.push("/document/create")}
      className="
        inline-flex
        items-center
        gap-2
        whitespace-nowrap
        rounded-lg
        bg-success
        px-18
        py-2
        text-sm
        font-medium
        text-white
        transition
        hover:opacity-90
      "
    >
      <RiAddCircleLine className="h-4 w-4 shrink-0" />

      <span>បង្កើតឯកសារ</span>
    </button>
  );

  return (
    <>
      {error ? (
        <div className="mb-3 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={loadDocuments}>Retry</button>
        </div>
      ) : null}
      <DataTable
        data={loading ? [] : filteredDocuments}
        columns={columns}
        filters={filters}
        searchQuery={search}
        onSearchChange={setSearch}
        actionButton={addButton}
        pageSize={15}
        downloadFilename="member-documents.csv"
      />

      {selectedCertificate && (
        <CompanyDocumentPreview
          document={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </>
  );
}

function mapMemberDocument(row) {
  const extension = row.file?.originalName?.split(".").pop()?.toUpperCase();
  const genderCode = row.member?.gender;
  const genderLabels = {
    MALE: "ប្រុស",
    FEMALE: "ស្រី",
    MONK: "ព្រះសង្ឃ",
  };
  const normalizedType = extension || row.type?.code || "FILE";
  return {
    id: row.id,
    title: row.title,
    memberName: row.member?.fullNameKm || row.member?.full_name_km || row.member?.fullNameEn || row.member?.full_name_en || "-",
    gender: row.member?.genderLabelKm || row.member?.gender_label_km || genderLabels[genderCode] || row.member?.genderLabelEn || row.member?.gender_label_en || "-",
    branch: row.branch?.nameKm || row.branch?.name_km || row.branch?.nameEn || row.branch?.name_en || "-",
    date: row.created_at ? row.created_at.slice(0, 10) : "-",
    size: formatSize(row.file?.sizeBytes),
    type: normalizedType,
    isImage: ["PNG", "JPG", "JPEG", "WEBP", "GIF"].includes(normalizedType),
    image: row.file?.id ? `/api/backend/files/${row.file.id}/content` : "/document.jpg",
  };
}

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
