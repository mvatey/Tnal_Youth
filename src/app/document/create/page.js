"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Award } from "lucide-react";
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

    router.back();
  };

  const handleSave = () => {
    console.log("Created document:", form);
  };

  return (
    <div className="min-h-full bg-bg-page-gray px-5 py-4">
      {!type ? (
        <>
          {/* Breadcrumb */}
          <div className="mb-2 flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => router.push("/document/member")}
              className="text-text-mute transition hover:text-primary"
            >
              ឯកសារ
            </button>

            <span className="text-text-mute">›</span>

            <span className="font-semibold text-primary">
              បង្កើតឯកសារ
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-primary">
              បង្កើតឯកសារ
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              ជ្រើសរើសប្រភេទឯកសារដែលអ្នកចង់បង្កើត
            </p>
          </div>

          {/* Document types */}
          <div className="mx-auto mt-14 grid max-w-[900px] grid-cols-1 gap-16 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => selectDocumentType("certificate")}
              className="group relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-[34px] border border-border bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute left-0 top-0 h-[12px] w-full bg-primary" />

              <div className="flex flex-col items-center gap-5">
                <Award
                  size={42}
                  className="text-primary opacity-0 transition group-hover:opacity-100"
                />

                <span className="text-3xl font-bold text-[#15204F]">
                  វិញ្ញាបនបត្រ
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => selectDocumentType("id_card")}
              className="group relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-[34px] border border-border bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute left-0 top-0 h-[12px] w-full bg-warning" />

              <div className="flex flex-col items-center gap-5">
                <CreditCard
                  size={42}
                  className="text-warning opacity-0 transition group-hover:opacity-100"
                />

                <span className="text-3xl font-bold text-[#15204F]">
                  ប័ណ្ណសមាជិក
                </span>
              </div>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Back navigation */}
          <div className="mb-5 flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm text-text-primary transition hover:bg-gray-50"
            >
              <ArrowLeft size={18} />
              ត្រឡប់
            </button>

            <h1 className="text-xl font-bold text-primary">
              {type === "certificate"
                ? "បង្កើតវិញ្ញាបនបត្រ"
                : "បង្កើតប័ណ្ណសមាជិក"}
            </h1>
          </div>

          {type === "certificate" && (
            <CertificateForm
              form={form}
              setForm={setForm}
              onSave={handleSave}
              onClose={() => setType("")}
            />
          )}

          {type === "id_card" && (
            <IdCardForm
              form={form}
              setForm={setForm}
              onSave={handleSave}
              onClose={() => setType("")}
            />
          )}
        </>
      )}
    </div>
  );
}