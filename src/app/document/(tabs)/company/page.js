"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import DataTable from "@/components/table/DataTable";
import AddDocumentForm from "@/components/document/AddDocumentForm";
import EditDocumentForm from "@/components/document/EditDocumentForm";
import CompanyDocumentPreview from "@/components/document/CompanyDocumentPreview";
import DeleteConfirmModal from "@/components/popup/Confirmdeletemodal";

import documentCompany from "@/data/documentCompany.json";

const EMPTY_FORM = {
  title: "",
  branch: "",
  description: "",
  date: "",
  files: [],
};
const DOCUMENT_TYPE_BADGE_STYLES = {
  PDF: "bg-red-100 text-red-500",
  Excel: "bg-success-bg text-success",
  Word: "bg-blue-50 text-blue-600",
  PowerPoint: "bg-orange-50 text-orange-600",
  PNG: "bg-purple-50 text-purple-600",
  JPG: "bg-yellow-50 text-yellow-600",
  JPEG: "bg-yellow-50 text-yellow-600",
};

const DEFAULT_DOCUMENT_TYPE_STYLE =
  "bg-gray-100 text-text-secondary";

export default function CompanyDocumentPage() {
  const [documents, setDocuments] = useState(documentCompany);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editDocument, setEditDocument] = useState(null);
  const [deleteDocument, setDeleteDocument] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const filteredDocuments = documents.filter((item) => {
    const searchValue = search.trim().toLowerCase();

    const matchSearch = item.title?.toLowerCase().includes(searchValue);
    const matchType = !typeFilter || item.type === typeFilter;
    const matchDate = !dateFilter || item.date === dateFilter;

    return matchSearch && matchType && matchDate;
  });

  const columns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
      align: "center",
      render: (_, index) => index ,
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
      width: "w-[25%]",
    },
    {
      header: "សាខា",
      accessor: "branch",
      width: "w-[15%]",
    },
    {
      header: "កាលបរិច្ឆេទ",
      accessor: "date",
      width: "w-[15%]",
    },
    {
      header: "ទំហំ",
      accessor: "size",
      width: "w-[10%]",
    },
    {
  header: "ប្រភេទឯកសារ",
  width: "w-[10%]",
  align: "center",
  render: (item) => {
    const badgeStyle =
      DOCUMENT_TYPE_BADGE_STYLES[item.type] ||
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
        {item.type}
      </span>
    );
  },
},
    {
      header: "សកម្មភាព",
      width: "w-[11%]",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center ">
          <button
            type="button"
            onClick={() => setSelectedDocument(item)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-blue-50"
            aria-label="មើលឯកសារ"
          >
            <Eye size={18} className="text-blue-500" />
          </button>

          <button
            type="button"
            onClick={() => setEditDocument({ ...item })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-yellow-50"
            aria-label="កែប្រែឯកសារ"
          >
            <Pencil size={18} className="text-yellow-500" />
          </button>

          <button
            type="button"
            onClick={() => setDeleteDocument(item)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-red-50"
            aria-label="លុបឯកសារ"
          >
            <Trash2 size={18} className="text-red-500" />
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
    onClick={() => setShowAddForm(true)}
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

    <span>បញ្ចូលឯកសារ</span>
  </button>
);

  const handleAddSave = (newDocumentFromForm) => {

  const newDocument = {
    id: Date.now(),

    title: newDocumentFromForm.title,

    branch: newDocumentFromForm.branch,

    description: newDocumentFromForm.description,

    date:
      newDocumentFromForm.date ||
      new Date().toISOString().slice(0,10),

    size: newDocumentFromForm.size || "-",

    // TAKE FROM CREATE FORM
    type: newDocumentFromForm.type,

    // FILE FORMAT ONLY
    fileFormat:
      newDocumentFromForm.fileFormat,

    image:
      newDocumentFromForm.image ||
      "/document.jpg",

    files:
      newDocumentFromForm.files || [],
  };


  setDocuments((previous)=>[
    newDocument,
    ...previous,
  ]);

  setForm(EMPTY_FORM);
  setShowAddForm(false);
};

  const handleEditSave = () => {
    setDocuments((previous) =>
      previous.map((item) =>
        item.id === editDocument.id
          ? { ...item, ...editDocument }
          : item,
      ),
    );

    setEditDocument(null);
  };

  const handleDeleteConfirm = () => {
    setDocuments((previous) =>
      previous.filter((item) => item.id !== deleteDocument.id),
    );

    setDeleteDocument(null);
  };

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
        downloadFilename="company-documents.csv"
      />

      {showAddForm && (
        <AddDocumentForm
          form={form}
          setForm={setForm}
          onClose={() => setShowAddForm(false)}
          onSave={handleAddSave}
        />
      )}

      {editDocument && (
        <EditDocumentForm
          form={editDocument}
          setForm={setEditDocument}
          onClose={() => setEditDocument(null)}
          onSave={handleEditSave}
        />
      )}

      {selectedDocument && (
        <CompanyDocumentPreview
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {deleteDocument && (
        <DeleteConfirmModal
          open
          onClose={() => setDeleteDocument(null)}
          onConfirm={handleDeleteConfirm}
          title="លុបឯកសារ"
          message={`តើអ្នកប្រាកដថាចង់លុប "${deleteDocument.title}" មែនទេ?`}
        />
      )}
    </>
  );
}