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

      {/* Title */}
      <h1 className="text-[30px] font-bold text-primary">
        {pageTitle}
      </h1>

      <p className="mt-2 text-sm text-text-secondary">
        {pageDescription}
      </p>

      {/* ======================== SELECT TYPE ======================== */}

      {!type && (
        <div className="mt-8">
          <div className="flex flex-wrap gap-6">
            {/* Certificate */}
            <div
              className="
                w-[300px]
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-md
                transition
                duration-200
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              <div className="h-[6px] bg-primary" />

              <div className="flex h-[130px] flex-col justify-between p-5">
                <div>
                  <h2 className="text-lg font-bold text-primary">
                    វិញ្ញាបនបត្រ
                  </h2>

                  <p className="mt-1 text-xs text-text-secondary">
                    បង្កើតវិញ្ញាបនបត្រសម្រាប់សមាជិក
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      selectDocumentType("certificate")
                    }
                    className="
                      h-8
                      w-[90px]
                      rounded-lg
                      bg-primary
                      text-xs
                      font-medium
                      text-white
                      transition
                      hover:opacity-90
                    "
                  >
                    ជ្រើសរើស
                  </button>
                </div>
              </div>
            </div>

            {/* Member Card */}
            <div
              className="
                w-[300px]
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-md
                transition
                duration-200
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              <div className="h-[6px] bg-warning" />

              <div className="flex h-[130px] flex-col justify-between p-5">
                <div>
                  <h2 className="text-lg font-bold text-primary">
                    ប័ណ្ណសមាជិក
                  </h2>

                  <p className="mt-1 text-xs text-text-secondary">
                    បង្កើតប័ណ្ណសម្គាល់សមាជិក
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      selectDocumentType("id_card")
                    }
                    className="
                      h-8
                      w-[90px]
                      rounded-lg
                      bg-warning
                      text-xs
                      font-medium
                      text-white
                      transition
                      hover:opacity-90
                    "
                  >
                    ជ្រើសរើស
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================== FORMS ======================== */}

      {type === "certificate" && (
        <CertificateForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={handleBack}
        />
      )}

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