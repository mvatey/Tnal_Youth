"use client";

import { useMemo, useState } from "react";
import { Download, CheckCircle } from "lucide-react";
import {
  initialDocuments,
  PAGE_SIZE,
  DEFAULT_IMAGE,
  MEMBER_IMAGE,
} from "@/data/documents";

import DocumentTabs from "@/components/document/DocumentTabs";
import DocumentFilters from "@/components/document/DocumentFilters";
import DocumentTable from "@/components/document/DocumentTable";
import DocumentPagination from "@/components/document/DocumentPagination";
import DocumentModal from "@/components/document/DocumentModal";
import DocumentForm from "@/components/document/DocumentForm";
import CertificateForm from "@/components/document/CertificateForm";

export default function DocumentPage() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [activeTab, setActiveTab] = useState("institution");
  const [pageMode, setPageMode] = useState("list");

  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalType, setModalType] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
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
  });

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      return (
        doc.category === activeTab &&
        doc.title.toLowerCase().includes(query.toLowerCase()) &&
        (branchFilter ? doc.branch === branchFilter : true) &&
        (dateFilter ? doc.date === dateFilter : true)
      );
    });
  }, [documents, activeTab, query, branchFilter, dateFilter]);

  const totalPages = Math.ceil(filteredDocuments.length / PAGE_SIZE);

  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDocuments.slice(start, start + PAGE_SIZE);
  }, [filteredDocuments, currentPage]);

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
    const isMember = activeTab === "member";

    setForm({
      title: "",
      memberName: "ម៉ៅ សំណាង",
      gender: "ប្រុស",
      branch: "សាខាភ្នំពេញ",
      date: isMember ? "Jan 6, 2022" : new Date().toISOString().split("T")[0],
      size: "100MB",
      type: "PDF",
      image: isMember ? MEMBER_IMAGE : DEFAULT_IMAGE,
      category: activeTab,
      description: "",
    });

    setSelectedDoc(null);

    if (isMember) {
      setPageMode("create-member");
    } else {
      setModalType("add");
    }
  }

  function openEditModal(doc) {
    setSelectedDoc(doc);
    setForm(doc);
    setModalType("edit");
  }

  function openViewModal(doc) {
    setSelectedDoc(doc);
    setModalType("view");
  }

  function openDeleteModal(doc) {
    setSelectedDoc(doc);
    setModalType("delete");
  }

  function closeModal() {
    setModalType(null);
    setSelectedDoc(null);
  }

  function handleSave() {
    if (!form.title.trim()) {
      alert("សូមបញ្ចូលឈ្មោះឯកសារ");
      return;
    }

    if (modalType === "add" || pageMode === "create-member") {
      setDocuments((prev) => [{ ...form, id: Date.now() }, ...prev]);
      setCurrentPage(1);

      showToast(
        activeTab === "member"
          ? "បានបង្កើតឯកសារដោយជោគជ័យ!"
          : "បានបញ្ចូលឯកសារដោយជោគជ័យ!"
      );

      setPageMode("list");
    }

    if (modalType === "edit") {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoc.id ? { ...form, id: selectedDoc.id } : doc
        )
      );

      showToast("បានកែប្រែឯកសារដោយជោគជ័យ!");
    }

    closeModal();
  }

  function handleDelete() {
    setDocuments((prev) => prev.filter((doc) => doc.id !== selectedDoc.id));
    closeModal();
    showToast("បានលុបឯកសារដោយជោគជ័យ!");
  }

  function handleDownload() {
    closeModal();
    showToast("ការទាញយកឯកសារបានជោគជ័យ!");
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-[#f6f7f9] p-2">
      {toast && <SuccessToast message={toast} />}

      <DocumentTabs activeTab={activeTab} onChangeTab={changeTab} />

      {pageMode === "create-member" ? (
        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-auto rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <CertificateForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={() => setPageMode("list")}
          />
        </div>
      ) : (
        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <DocumentFilters
            activeTab={activeTab}
            query={query}
            setQuery={setQuery}
            branchFilter={branchFilter}
            setBranchFilter={setBranchFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            resetPage={resetPage}
            onAdd={openAddModal}
          />

          <DocumentTable
            activeTab={activeTab}
            documents={paginatedDocuments}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />

          <DocumentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

      {(modalType === "add" || modalType === "edit") && (
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

      {modalType === "view" && selectedDoc && (
  <DocumentModal
    onClose={closeModal}
     size="certificate"
  >
          {activeTab === "member" ? (
            <MemberDocumentView
              selectedDoc={selectedDoc}
              onDownload={handleDownload}
            />
          ) : (
            <InstitutionDocumentView
              selectedDoc={selectedDoc}
              onDownload={handleDownload}
            />
          )}
        </DocumentModal>
      )}

      {modalType === "delete" && selectedDoc && (
        <DocumentModal onClose={closeModal}>
          <h2 className="text-lg font-semibold text-red-600">លុបឯកសារ</h2>

          <p className="mt-3 text-sm text-gray-600">
            តើអ្នកប្រាកដថាចង់លុប "{selectedDoc.title}" មែនទេ?
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={closeModal} className="rounded-lg border px-4 py-2">
              បោះបង់
            </button>

            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              លុប
            </button>
          </div>
        </DocumentModal>
      )}
    </div>
  );
}

function InstitutionDocumentView({ selectedDoc, onDownload }) {
  return (
    <>
      <h2 className="mb-5 text-lg font-bold text-[#4b3192]">ឯកសារស្ថាប័ន</h2>

      <div className="flex justify-center">
        <img
  src={selectedDoc.image}
  alt="document"
  className="
  h-[280px]
  w-[210px]
  rounded-lg
  border
  object-contain
  "
/>
      </div>

      <button
        onClick={onDownload}
        className="mt-5 flex h-[38px] w-full items-center justify-center gap-2 rounded-lg bg-[#4b3192] text-sm font-semibold text-white"
      >
        <Download className="h-4 w-4" />
        ទាញយក
      </button>
    </>
  );
}

function MemberDocumentView({ selectedDoc, onDownload }) {
  return (
    <div className="w-[300px]">

      {/* Title */}
      <h2
        className="
        mb-5
        text-xl
        font-bold
        text-[#4b3192]
        "
      >
        ព័ត៌មានឯកសារ
      </h2>


      {/* Certificate Preview */}
      <div className="flex justify-center">

        <img
          src={selectedDoc.image}
          alt="certificate"

          className="
          h-[150px]
          w-[220px]
          rounded-lg
          border
          object-contain
          "
        />

      </div>



      {/* Information */}
      <div className="mt-5">


        <h3
          className="
          mb-4
          text-sm
          font-bold
          text-gray-700
          "
        >
          ព័ត៌មានសមាជិក
        </h3>



        <div
          className="
          grid
          grid-cols-2
          gap-y-3
          text-sm
          "
        >

          <span className="text-gray-400">
            បុគ្គលិក
          </span>

          <span className="text-gray-700">
            {selectedDoc.memberName}
          </span>



          <span className="text-gray-400">
            កាលបរិច្ឆេទ
          </span>

          <span className="text-gray-700">
            {selectedDoc.date}
          </span>



          <span className="text-gray-400">
            សាខា
          </span>

          <span className="text-gray-700">
            {selectedDoc.branch}
          </span>


        </div>


      </div>




      {/* Download Button */}
      <button
        onClick={onDownload}

        className="
        mt-5
        flex
        h-[36px]
        w-full
        items-center
        justify-center
        gap-2
        rounded-lg
        bg-[#4b3192]
        text-sm
        font-medium
        text-white
        "
      >

        <Download className="h-4 w-4"/>

        ទាញយក

      </button>


    </div>
  );
}

function SuccessToast({ message }) {
  return (
    <div className="fixed left-1/2 top-10 z-[999] flex w-[360px] -translate-x-1/2 items-center justify-between rounded-md bg-white px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-gray-700">{message}</span>
      </div>

      <span className="rounded bg-[#4b3192] px-3 py-1 text-xs text-white">
        ជោគជ័យ
      </span>
    </div>
  );
}