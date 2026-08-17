"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import DataTable from "@/components/table/DataTable";
import AddDocumentForm from "@/components/document/AddDocumentForm";
import EditDocumentForm from "@/components/document/EditDocumentForm";
import CompanyDocumentPreview from "@/components/document/CompanyDocumentPreview";
import DeleteConfirmModal from "@/components/popup/Confirmdeletemodal";

const EMPTY_FORM = {
  title: "",
  branch: "",
  description: "",
  date: "",
  files: [],
};
const DOCUMENT_TYPE_BADGE_STYLES = {
  PDF: "bg-error-bg text-error",
  Excel: "bg-success-bg text-success",
  Word: "bg-primary-light text-primary",
  PowerPoint: "bg-warning-bg text-warning",
  PNG: "bg-secondary-light text-secondary",
  JPG: "bg-warning-bg text-warning",
  JPEG: "bg-warning-bg text-warning",
};

const DEFAULT_DOCUMENT_TYPE_STYLE =
  "bg-bg-page-gray text-text-secondary";

export default function CompanyDocumentPage() {
  const [documents, setDocuments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editDocument, setEditDocument] = useState(null);
  const [deleteDocument, setDeleteDocument] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const responses = await Promise.all([
        fetch("/api/backend/documents", { cache: "no-store" }),
        fetch("/api/lookups/branches", { cache: "no-store" }),
        fetch("/api/backend/document-types", { cache: "no-store" }),
      ]);
      if (responses.some((response) => !response.ok)) throw new Error("Unable to load documents.");
      const [documentBody, branchBody, typeBody] = await Promise.all(responses.map((response) => response.json()));
      const documentRows = documentBody?.data ?? documentBody;
      setDocuments(
        (Array.isArray(documentRows) ? documentRows : [])
          .filter((row) => row.branch && !row.member)
          .map(mapDocument),
      );
      setBranches(Array.isArray(branchBody) ? branchBody : (branchBody?.data ?? []));
      setDocumentTypes(Array.isArray(typeBody) ? typeBody : (typeBody?.data ?? []));
    } catch (loadError) {
      setError(loadError.message || "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(); }, [loadPage]);

  const branchOptions = useMemo(() => branches
    .map((branch) => {
      const value =
        branch.value ??
        branch.id ??
        branch.branchId ??
        branch.branch_id;

      const label =
        branch.labelKm ??
        branch.label_km ??
        branch.nameKm ??
        branch.name_km ??
        branch.labelEn ??
        branch.label_en ??
        branch.nameEn ??
        branch.name_en ??
        branch.label ??
        branch.name;

      return {
        value: value == null ? "" : String(value),
        label: label == null ? "" : String(label),
      };
    })
    .filter((option) => option.value && option.label), [branches]);
  const documentTypeOptions = useMemo(() => documentTypes.map((type) => ({
    value: String(type.id),
    label: type.labelKm || type.label_km || type.labelEn || type.label_en || type.code,
  })), [documentTypes]);

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
          className="h-8 w-6 rounded border border-border object-cover"
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
      accessor: "branchName",
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
            onClick={() => setSelectedDocument({ ...item, branch: item.branchName })}
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-error-bg"
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

  const handleAddSave = async (newDocumentFromForm) => {
    setSaving(true);
    setError("");
    try {
      for (const item of newDocumentFromForm.files) {
        const upload = new FormData();
        upload.append("file", item.file);
        const uploadResponse = await fetch("/api/backend/files/attachments", { method: "POST", body: upload });
        const uploadedFile = await uploadResponse.json().catch(() => null);
        if (!uploadResponse.ok) throw new Error(uploadedFile?.message || "File upload failed.");
        const createResponse = await fetch("/api/backend/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type_id: Number(newDocumentFromForm.type),
            file_id: uploadedFile.id,
            title: newDocumentFromForm.title,
            description: newDocumentFromForm.description,
            branch_id: Number(newDocumentFromForm.branch),
          }),
        });
        const created = await createResponse.json().catch(() => null);
        if (!createResponse.ok) throw new Error(created?.message || "Unable to save document.");
      }
      setForm(EMPTY_FORM);
      setShowAddForm(false);
      await loadPage();
    } catch (saveError) {
      setError(saveError.message || "Unable to save document.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (updatedDocument) => {
    const response = await fetch(`/api/backend/documents/${updatedDocument.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type_id: updatedDocument.typeId,
        file_id: updatedDocument.fileId,
        title: updatedDocument.title,
        description: updatedDocument.description || "",
        branch_id: Number(updatedDocument.branch),
      }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || "Unable to update document.");
    setEditDocument(null);
    await loadPage();
  };

  const handleDeleteConfirm = async () => {
    const response = await fetch(`/api/backend/documents/${deleteDocument.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message || "Unable to delete document.");
      return;
    }
    setDeleteDocument(null);
    await loadPage();
  };

  return (
    <>
      {error ? <div className="mb-3 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
      <DataTable
        data={loading ? [] : filteredDocuments}
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
          branchOptions={branchOptions}
          documentTypeOptions={documentTypeOptions}
          saving={saving}
        />
      )}

      {editDocument && (
        <EditDocumentForm
          form={editDocument}
          setForm={setEditDocument}
          onClose={() => setEditDocument(null)}
          onSave={handleEditSave}
          branchOptions={branchOptions}
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

function mapDocument(row) {
  const extension = row.file?.originalName?.split(".").pop()?.toUpperCase();
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    branch: String(row.branch?.id || ""),
    branchName: row.branch?.nameKm || row.branch?.name_km || row.branch?.nameEn || row.branch?.name_en || "-",
    branchId: row.branch?.id,
    date: row.created_at ? row.created_at.slice(0, 10) : "-",
    size: formatSize(row.file?.sizeBytes),
    type: extension || row.type?.code || "FILE",
    typeId: row.type?.id,
    fileId: row.file?.id,
    image: row.file?.id ? `/api/backend/files/${row.file.id}/content` : "/document.jpg",
    files: row.file ? [{ name: row.file.originalName, size: formatSize(row.file.sizeBytes), type: extension || "FILE" }] : [],
  };
}

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
