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
    const searchValue = search.toLowerCase();

    const matchSearch =
      item.title?.toLowerCase().includes(searchValue) ||
      item.memberName?.toLowerCase().includes(searchValue);

    const matchType = typeFilter === "" || item.type === typeFilter;
    const matchDate = dateFilter === "" || item.date === dateFilter;

    return matchSearch && matchType && matchDate;
  });

  const columns = [
    {
      header: "ល.រ",
      width: "w-[5%]",
      align: "center",
      render: (_, index) => index + 1,
    },
    {
      header: "រូបភាព",
      width: "w-[8%]",
      render: (item) => (
        <img
          src={item.image}
          alt={item.title || "certificate"}
          className="h-8 w-12 rounded border object-cover"
        />
      ),
    },
    {
      header: "ឈ្មោះឯកសារ",
      accessor: "title",
      width: "w-[15%]",
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
      width: "w-[12%]",
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
        <span className="rounded-md bg-red-100 px-3 py-1 text-xs text-red-500">
          {item.type}
        </span>
      ),
    },
    {
      header: "សកម្មភាព",
      width: "w-[7%]",
      align: "center",
      render: (item) => (
        <button
          type="button"
          onClick={() => setSelectedCertificate(item)}
          className="inline-flex items-center justify-center"
          aria-label="មើលឯកសារ"
        >
          <Eye size={18} className="text-blue-500" />
        </button>
      ),
    },
  ];

  const filters = [
    {
      name: "type",
      placeholder: "ប្រភេទ",
      value: typeFilter,
      options: [...new Set(documents.map((item) => item.type))].map((type) => ({
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
      className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
    >
      <RiAddCircleLine size={18} />
      បង្កើតឯកសារ
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
