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
  type: "",
  files: [],
};

async function readResponse(response) {
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "The request could not be completed.");
  }
  return payload?.data ?? payload;
}

function formatFileSize(file) {
  const bytes = Number(file?.sizeBytes ?? file?.size_bytes ?? 0);
  if (!bytes) return "-";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExtension(name = "") {
  return name.includes(".") ? name.split(".").pop().toUpperCase() : "FILE";
}

function toDocumentRow(record) {
  const file = record?.file || {};
  const branch = record?.branch || {};
  const type = record?.type || {};
  const fileId = file.id;
  const mimeType = file.mimeType || file.mime_type || "";
  const fileUrl = fileId ? `/api/backend/files/${encodeURIComponent(fileId)}/content` : "";
  const createdAt = record.created_at || record.createdAt || "";

  return {
    id: record.id,
    title: record.title || "-",
    description: record.description || "",
    branchId: branch.id,
    branch: branch.name_km || branch.nameKm || branch.name_en || branch.nameEn || "-",
    typeId: type.id,
    type: type.label_km || type.labelKm || type.label_en || type.labelEn || type.code || "-",
    fileId,
    fileName: file.originalName || file.original_name || "document",
    fileFormat: fileExtension(file.originalName || file.original_name),
    mimeType,
    size: formatFileSize(file),
    date: createdAt ? String(createdAt).slice(0, 10) : "",
    fileUrl,
    image: mimeType.startsWith("image/") ? fileUrl : "/document.jpg",
  };
}

async function uploadDocumentFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const endpoint = file.type?.startsWith("image/")
    ? "/api/backend/files/images"
    : "/api/backend/files/attachments";
  const response = await fetch(endpoint, { method: "POST", body: formData });
  return readResponse(response);
}

export default function CompanyDocumentPage() {
  const [documents, setDocuments] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editDocument, setEditDocument] = useState(null);
  const [deleteDocument, setDeleteDocument] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [documentResponse, branchResponse, typeResponse] = await Promise.all([
        fetch("/api/backend/documents", { cache: "no-store" }),
        fetch("/api/lookups/branches", { cache: "no-store" }),
        fetch("/api/backend/document-types", { cache: "no-store" }),
      ]);
      const [documentRecords, branches, types] = await Promise.all([
        readResponse(documentResponse),
        readResponse(branchResponse),
        readResponse(typeResponse),
      ]);

      setDocuments((Array.isArray(documentRecords) ? documentRecords : [])
        .filter((record) => record?.branch?.id)
        .map(toDocumentRow));
      setBranchOptions((Array.isArray(branches) ? branches : []).map((branch) => ({
        value: String(branch.value ?? branch.id),
        label: branch.labelKm || branch.label_km || branch.labelEn || branch.label_en || branch.name_km || branch.name_en,
      })));
      setDocumentTypeOptions((Array.isArray(types) ? types : []).map((type) => ({
        value: String(type.id),
        label: type.label_km || type.labelKm || type.label_en || type.labelEn || type.code,
      })));
    } catch (loadError) {
      setError(loadError.message || "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDocuments = useMemo(() => documents.filter((item) => {
    const query = search.trim().toLowerCase();
    return (!query || item.title.toLowerCase().includes(query) || item.branch.toLowerCase().includes(query))
      && (!typeFilter || item.type === typeFilter)
      && (!dateFilter || item.date === dateFilter);
  }), [documents, search, typeFilter, dateFilter]);

  const handleAddSave = async (newDocument) => {
    setSaving(true);
    setFormError("");
    const uploadedIds = [];
    try {
      const createdRecords = [];
      for (const selected of newDocument.files || []) {
        const uploaded = await uploadDocumentFile(selected.file);
        uploadedIds.push(uploaded.id);
        const response = await fetch("/api/backend/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type_id: Number(newDocument.type),
            file_id: Number(uploaded.id),
            title: newDocument.files.length > 1
              ? `${newDocument.title} - ${selected.name}`
              : newDocument.title,
            description: newDocument.description || null,
            branch_id: Number(newDocument.branch),
            member_id: null,
            activity_id: null,
            uploaded_by: null,
          }),
        });
        createdRecords.push(await readResponse(response));
      }
      setDocuments((current) => [...createdRecords.map(toDocumentRow), ...current]);
      setForm(EMPTY_FORM);
      setShowAddForm(false);
    } catch (saveError) {
      setFormError(saveError.message || "Unable to save the document.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (updatedForm) => {
    setSaving(true);
    setFormError("");
    let replacementFile = null;
    try {
      if (updatedForm.newFile) replacementFile = await uploadDocumentFile(updatedForm.newFile);
      const response = await fetch(`/api/backend/documents/${encodeURIComponent(updatedForm.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_id: Number(updatedForm.typeId),
          file_id: Number(replacementFile?.id || updatedForm.fileId),
          title: updatedForm.title.trim(),
          description: updatedForm.description || null,
          branch_id: Number(updatedForm.branchId),
          member_id: null,
          activity_id: null,
          uploaded_by: null,
        }),
      });
      const saved = toDocumentRow(await readResponse(response));
      setDocuments((current) => current.map((item) => item.id === saved.id ? saved : item));
      setEditDocument(null);
    } catch (saveError) {
      setFormError(saveError.message || "Unable to update the document.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDocument) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/backend/documents/${encodeURIComponent(deleteDocument.id)}`, {
        method: "DELETE",
      });
      await readResponse(response);
      setDocuments((current) => current.filter((item) => item.id !== deleteDocument.id));
      setDeleteDocument(null);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete the document.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "ល.រ", width: "w-[6%]", align: "center", render: (_, index) => index + 1 },
    { header: "ឯកសារ", width: "w-[8%]", render: (item) => (
      <img src={item.image} alt={item.title} className="h-8 w-6 rounded border border-gray-200 object-cover" />
    ) },
    { header: "ឈ្មោះឯកសារ", accessor: "title", width: "w-[25%]" },
    { header: "សាខា", accessor: "branch", width: "w-[15%]" },
    { header: "កាលបរិច្ឆេទ", accessor: "date", width: "w-[15%]" },
    { header: "ទំហំ", accessor: "size", width: "w-[10%]" },
    { header: "ប្រភេទឯកសារ", accessor: "type", width: "w-[10%]" },
    { header: "សកម្មភាព", width: "w-[11%]", align: "center", render: (item) => (
      <div className="flex items-center justify-center">
        <button type="button" onClick={() => setSelectedDocument(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-blue-50" aria-label="មើលឯកសារ"><Eye size={18} className="text-blue-500" /></button>
        <button type="button" onClick={() => { setFormError(""); setEditDocument({ ...item }); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-yellow-50" aria-label="កែប្រែឯកសារ"><Pencil size={18} className="text-yellow-500" /></button>
        <button type="button" onClick={() => setDeleteDocument(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-50" aria-label="លុបឯកសារ"><Trash2 size={18} className="text-red-500" /></button>
      </div>
    ) },
  ];

  const filters = [
    {
      name: "type",
      placeholder: "ប្រភេទឯកសារ",
      value: typeFilter,
      options: [...new Set(documents.map((item) => item.type))].map((type) => ({ label: type, value: type })),
      onChange: setTypeFilter,
    },
    { name: "date", type: "date", placeholder: "ថ្ងៃ/ខែ/ឆ្នាំ", value: dateFilter, onChange: setDateFilter },
  ];

  const addButton = (
    <button type="button" onClick={() => { setFormError(""); setShowAddForm(true); }} className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-success px-3 py-2 text-sm font-medium text-white hover:opacity-90">
      <RiAddCircleLine className="h-4 w-4" />
      <span>បញ្ចូលឯកសារ</span>
    </button>
  );

  return (
    <>
      {error && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <button type="button" onClick={loadData} className="font-semibold underline">Retry</button>
        </div>
      )}
      {loading && <p className="mb-3 text-sm text-gray-500">Loading documents...</p>}
      <DataTable data={filteredDocuments} columns={columns} filters={filters} searchQuery={search} onSearchChange={setSearch} actionButton={addButton} pageSize={15} downloadFilename="company-documents.csv" />

      {showAddForm && (
        <AddDocumentForm form={form} setForm={setForm} onClose={() => { if (!saving) setShowAddForm(false); }} onSave={handleAddSave} branchOptions={branchOptions} documentTypeOptions={documentTypeOptions} saving={saving} error={formError} />
      )}
      {editDocument && (
        <EditDocumentForm form={editDocument} setForm={setEditDocument} onClose={() => { if (!saving) setEditDocument(null); }} onSave={handleEditSave} branchOptions={branchOptions} saving={saving} error={formError} />
      )}
      {selectedDocument && <CompanyDocumentPreview document={selectedDocument} onClose={() => setSelectedDocument(null)} />}
      {deleteDocument && (
        <DeleteConfirmModal open onClose={() => { if (!saving) setDeleteDocument(null); }} onConfirm={handleDeleteConfirm} title="លុបឯកសារ" message={`តើអ្នកពិតជាចង់លុប "${deleteDocument.title}" មែនទេ?`} />
      )}
    </>
  );
}
