"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CertificateForm from "@/app/document/CertificateForm";
import IdCardForm from "@/app/document/IdCardForm";

const EMPTY_FORM = {
  title: "",
  branch: "",
  description: "",
  type: "",
  member: "",
  gender: "",
  font: "Noto Sans",
  fontSize: "6px",
  color: "#12224c",
  language: "ភាសាខ្មែរ",
};

export default function CreateDocumentPage() {
  const router = useRouter();

  const [type, setType] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const selectDocumentType = (selectedType) => {
    setType(selectedType);

    setForm((previous) => ({
      ...previous,
      type:
        selectedType === "certificate"
          ? "វិញ្ញាបនបត្រ"
          : "ប័ណ្ណសមាជិក",
    }));
  };

  const handleBack = () => {
    if (type) {
      setType("");
      return;
    }

    router.push("/document/member");
  };

  const handleSave = () => {
    console.log("Created document:", form);

    router.push("/document/member");
  };

  const pageTitle =
    type === "certificate"
      ? "បង្កើតវិញ្ញាបនបត្រ"
      : type === "id_card"
        ? "បង្កើតប័ណ្ណសមាជិក"
        : "បង្កើតឯកសារ";

  const pageDescription =
    type === "certificate"
      ? "បំពេញព័ត៌មានដើម្បីបង្កើតវិញ្ញាបនបត្រ"
      : type === "id_card"
        ? "បំពេញព័ត៌មានដើម្បីបង្កើតប័ណ្ណសមាជិក"
        : "ជ្រើសរើសប្រភេទឯកសារដែលអ្នកចង់បង្កើត";

  return (
    <div className="min-h-full bg-bg-page-gray px-5 py-4">
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => router.push("/document/member")}
            className="font-medium text-text-mute transition hover:text-primary"
          >
            បញ្ជីឯកសារ
          </button>

          <span className="text-lg text-text-mute">›</span>

          {type && (
            <>
              <button
                type="button"
                onClick={() => setType("")}
                className="font-medium text-text-mute transition hover:text-primary"
              >
                ប្រភេទឯកសារ
              </button>

              <span className="text-lg text-text-mute">›</span>
            </>
          )}

          <span className="font-semibold text-primary">
            {pageTitle}
          </span>
        </div>

        {/* Main title */}
        <h1 className="text-[30px] font-bold leading-tight text-primary">
          {pageTitle}
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-sm text-text-secondary">
          {pageDescription}
        </p>
      </div>

      {/* Select document type */}
      {!type && (
        <div className="mx-auto mt-10 grid max-w-[900px] grid-cols-1 gap-10 md:grid-cols-2">
          {/* Certificate */}
          <button
            type="button"
            onClick={() => selectDocumentType("certificate")}
            className="
              group
              relative
              flex
              h-[210px]
              w-full
              items-center
              justify-center
              overflow-hidden
              rounded-[24px]
              border
              border-border
              bg-white
              shadow-md
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            <div className="absolute left-0 top-0 h-[8px] w-full bg-primary" />

            <span className="text-2xl font-bold text-[#15204F]">
              វិញ្ញាបនបត្រ
            </span>
          </button>

          {/* ID Card */}
          <button
            type="button"
            onClick={() => selectDocumentType("id_card")}
            className="
              group
              relative
              flex
              h-[210px]
              w-full
              items-center
              justify-center
              overflow-hidden
              rounded-[24px]
              border
              border-border
              bg-white
              shadow-md
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            <div className="absolute left-0 top-0 h-[8px] w-full bg-warning" />

            <span className="text-2xl font-bold text-[#15204F]">
              ប័ណ្ណសមាជិក
            </span>
          </button>
        </div>
      )}

      {/* Certificate form */}
      {type === "certificate" && (
        <CertificateForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={handleBack}
        />
      )}

      {/* ID card form */}
      {type === "id_card" && (
        <IdCardForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={handleBack}
        />
      )}
    </div>
  );
}