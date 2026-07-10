"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Download } from "lucide-react";

import {
  DEFAULT_IMAGE,
  initialDocuments,
  MEMBER_IMAGE,
  PAGE_SIZE,
} from "@/data/documents";

import CertificateForm from "@/components/document/CertificateForm";
import DocumentFilters from "@/components/document/DocumentFilters";
import DocumentForm from "@/components/document/DocumentForm";
import DocumentModal from "@/components/document/DocumentModal";
import DocumentPagination from "@/components/document/DocumentPagination";
import DocumentTable from "@/components/document/DocumentTable";
import DocumentTabs from "@/components/document/DocumentTabs";

const DEFAULT_FORM = {
  title: "",
  memberName: "ម៉ៅ សំណាង",
  gender: "ប្រុស",
  branch: "សាខាភ្នំពេញ",
  date: "",
  size: "100MB",
  type: "PDF",
  image: DEFAULT_IMAGE,
  category: "institution",
  description: "",
};

export default function DocumentPage() {
  const [documents, setDocuments] =
    useState(initialDocuments);

  const [activeTab, setActiveTab] =
    useState("institution");

  const [pageMode, setPageMode] =
    useState("list");

  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] =
    useState("");
  const [dateFilter, setDateFilter] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [modalType, setModalType] =
    useState(null);

  const [selectedDoc, setSelectedDoc] =
    useState(null);

  const [toast, setToast] = useState(null);

  const [form, setForm] =
    useState(DEFAULT_FORM);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return documents.filter((document) => {
      const matchesCategory =
        document.category === activeTab;

      const matchesSearch =
        !normalizedQuery ||
        document.title
          ?.toLowerCase()
          .includes(normalizedQuery) ||
        document.memberName
          ?.toLowerCase()
          .includes(normalizedQuery);

      const matchesBranch =
        !branchFilter ||
        document.branch === branchFilter;

      const matchesDate =
        !dateFilter ||
        document.date === dateFilter;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesBranch &&
        matchesDate
      );
    });
  }, [
    documents,
    activeTab,
    query,
    branchFilter,
    dateFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredDocuments.length / PAGE_SIZE
    )
  );

  const paginatedDocuments = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PAGE_SIZE;

    return filteredDocuments.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredDocuments, currentPage]);

  function showToast(message) {
    setToast(message);

    window.setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  function resetPage() {
    setCurrentPage(1);
  }

  function changeTab(tab) {
    setActiveTab(tab);
    setPageMode("list");
    setQuery("");
    setBranchFilter("");
    setDateFilter("");
    setCurrentPage(1);
  }

  function openAddModal() {
    const isMemberTab =
      activeTab === "member";

    setForm({
      ...DEFAULT_FORM,
      date: isMemberTab
        ? "Jan 6, 2022"
        : new Date()
            .toISOString()
            .split("T")[0],

      image: isMemberTab
        ? MEMBER_IMAGE
        : DEFAULT_IMAGE,

      category: activeTab,
    });

    setSelectedDoc(null);

    if (isMemberTab) {
      setPageMode("create-member");
      return;
    }

    setModalType("add");
  }

  function openEditModal(document) {
    setSelectedDoc(document);
    setForm(document);
    setModalType("edit");
  }

  function openViewModal(document) {
    setSelectedDoc(document);
    setModalType("view");
  }

  function openDeleteModal(document) {
    setSelectedDoc(document);
    setModalType("delete");
  }

  function closeModal() {
    setModalType(null);
    setSelectedDoc(null);
  }

  function handleSave() {
    if (!form.title?.trim()) {
      alert("សូមបញ្ចូលឈ្មោះឯកសារ");
      return;
    }

    if (
      modalType === "add" ||
      pageMode === "create-member"
    ) {
      setDocuments((currentDocuments) => [
        {
          ...form,
          id: Date.now(),
        },
        ...currentDocuments,
      ]);

      setCurrentPage(1);
      setPageMode("list");

      showToast(
        activeTab === "member"
          ? "បានបង្កើតឯកសារដោយជោគជ័យ!"
          : "បានបញ្ចូលឯកសារដោយជោគជ័យ!"
      );
    }

    if (
      modalType === "edit" &&
      selectedDoc
    ) {
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === selectedDoc.id
            ? {
                ...form,
                id: selectedDoc.id,
              }
            : document
        )
      );

      showToast(
        "បានកែប្រែឯកសារដោយជោគជ័យ!"
      );
    }

    closeModal();
  }

  function handleDelete() {
    if (!selectedDoc) return;

    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (document) =>
          document.id !== selectedDoc.id
      )
    );

    closeModal();

    showToast(
      "បានលុបឯកសារដោយជោគជ័យ!"
    );
  }

  function handleDownload() {
    closeModal();

    showToast(
      "ការទាញយកឯកសារបានជោគជ័យ!"
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col bg-[#f7f7fa] px-4 pb-4 pt-3">
      {toast && (
        <SuccessToast message={toast} />
      )}

      {/* Tabs */}
      <div className="shrink-0 border-b border-[#ececf2] bg-white px-0">
        <DocumentTabs
          activeTab={activeTab}
          onChangeTab={changeTab}
        />
      </div>

      {pageMode === "create-member" ? (
        <main className="mt-3 min-h-0 flex-1 overflow-auto rounded-lg border border-[#eeeeF3] bg-white p-5">
          <CertificateForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={() =>
              setPageMode("list")
            }
          />
        </main>
      ) : (
        <main className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#eeeeF3] bg-white">
          {/* Filters */}
          <div className="shrink-0 px-4 pb-3 pt-4">
            <DocumentFilters
              activeTab={activeTab}
              query={query}
              setQuery={setQuery}
              branchFilter={branchFilter}
              setBranchFilter={
                setBranchFilter
              }
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              resetPage={resetPage}
              onAdd={openAddModal}
            />
          </div>

          {/* Table */}
          <div className="min-h-0 flex-1 overflow-auto px-4">
            <DocumentTable
              activeTab={activeTab}
              documents={
                paginatedDocuments
              }
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              onView={openViewModal}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          </div>

          {/* Pagination */}
          <div className="shrink-0 border-t border-[#f0f0f4] bg-white px-4 py-3">
            <DocumentPagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={
                setCurrentPage
              }
            />
          </div>
        </main>
      )}

      {(modalType === "add" ||
        modalType === "edit") && (
        <DocumentModal onClose={closeModal}>
          <DocumentForm
            modalType={modalType}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={closeModal}
          />
        </DocumentModal>
      )}

      {modalType === "view" &&
        selectedDoc && (
          <DocumentModal
            onClose={closeModal}
            size="certificate"
          >
            {activeTab === "member" ? (
              <MemberDocumentView
                selectedDoc={selectedDoc}
                onDownload={
                  handleDownload
                }
              />
            ) : (
              <InstitutionDocumentView
                selectedDoc={selectedDoc}
                onDownload={
                  handleDownload
                }
              />
            )}
          </DocumentModal>
        )}

      {modalType === "delete" &&
        selectedDoc && (
          <DocumentModal onClose={closeModal}>
            <h2 className="text-lg font-bold text-red-600">
              លុបឯកសារ
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              តើអ្នកប្រាកដថាចង់លុប "
              {selectedDoc.title}" មែនទេ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="h-10 rounded-lg border border-gray-200 bg-white px-5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                បោះបង់
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="h-10 rounded-lg bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                លុប
              </button>
            </div>
          </DocumentModal>
        )}
    </div>
  );
}

function InstitutionDocumentView({
  selectedDoc,
  onDownload,
}) {
  return (
    <div className="w-full">
      <h2 className="mb-5 text-lg font-bold text-[#4b3192]">
        ឯកសារស្ថាប័ន
      </h2>

      <div className="flex justify-center">
        <img
          src={selectedDoc.image}
          alt={selectedDoc.title || "document"}
          className="h-[280px] w-[210px] rounded-lg border border-gray-200 object-contain"
        />
      </div>

      <button
        type="button"
        onClick={onDownload}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#4b3192] text-sm font-semibold text-white transition hover:bg-[#3d2877]"
      >
        <Download size={16} />
        ទាញយក
      </button>
    </div>
  );
}

function MemberDocumentView({
  selectedDoc,
  onDownload,
}) {
  return (
    <div className="w-[320px] max-w-full">
      <h2 className="mb-5 text-xl font-bold text-[#4b3192]">
        ព័ត៌មានឯកសារ
      </h2>

      <div className="flex justify-center">
        <img
          src={selectedDoc.image}
          alt={
            selectedDoc.title ||
            "certificate"
          }
          className="h-[160px] w-[230px] rounded-lg border border-gray-200 object-contain"
        />
      </div>

      <div className="mt-5">
        <h3 className="mb-4 text-sm font-bold text-gray-700">
          ព័ត៌មានសមាជិក
        </h3>

        <div className="grid grid-cols-[110px_1fr] gap-y-3 text-sm">
          <span className="text-gray-400">
            បុគ្គលិក
          </span>

          <span className="text-gray-700">
            {selectedDoc.memberName ||
              "-"}
          </span>

          <span className="text-gray-400">
            កាលបរិច្ឆេទ
          </span>

          <span className="text-gray-700">
            {selectedDoc.date || "-"}
          </span>

          <span className="text-gray-400">
            សាខា
          </span>

          <span className="text-gray-700">
            {selectedDoc.branch || "-"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDownload}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#4b3192] text-sm font-medium text-white transition hover:bg-[#3d2877]"
      >
        <Download size={16} />
        ទាញយក
      </button>
    </div>
  );
}

function SuccessToast({ message }) {
  return (
    <div className="fixed left-1/2 top-6 z-[999] flex w-[360px] max-w-[calc(100vw-32px)] -translate-x-1/2 items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <div className="flex min-w-0 items-center gap-3">
        <CheckCircle
          size={20}
          className="shrink-0 text-green-600"
        />

        <span className="truncate text-sm font-medium text-gray-700">
          {message}
        </span>
      </div>

      <span className="ml-3 shrink-0 rounded bg-[#4b3192] px-3 py-1 text-xs text-white">
        ជោគជ័យ
      </span>
    </div>
  );
}
