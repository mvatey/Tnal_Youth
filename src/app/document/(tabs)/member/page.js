"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import DataTable from "@/components/table/DataTable";
import CertificatePreview from "@/components/document/certificatePreview";
import documentMember from "@/data/documentMember.json";

export default function MemberDocumentPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const documents = documentMember;

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
      render: (_, index) => index + 1,
    },
    {
      header: "ឯកសារ",
      width: "w-[8%]",
      render: (item) => (
        <img
          src={item.image || "/document.jpg"}
          alt={item.title || "document"}
          className="h-8 w-6 rounded border border-gray-200 object-cover"
        />
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
      render: (item) => (
        <span className="inline-flex rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-500">
          {item.type}
        </span>
      ),
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-blue-50"
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
      options: [...new Set(documents.map((item) => item.type))].map(
        (type) => ({
          label: type,
          value: type,
        }),
      ),
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
      px-3
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
      <DataTable
        data={filteredDocuments}
        columns={columns}
        filters={filters}
        searchQuery={search}
        onSearchChange={setSearch}
        actionButton={addButton}
        pageSize={15}
        downloadFilename="member-documents.csv"
      />

      {selectedCertificate && (
        <CertificatePreview
          document={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </>
  );
}