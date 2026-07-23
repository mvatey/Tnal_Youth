"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import CertificateForm from "@/app/document/CertificateForm";
import IdCardForm from "@/app/document/IdCardForm";

export default function CreateDocumentPage() {
  const [type, setType] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
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
  });

  return (
    <div
      className="
      p-6
      "
    >
      {/* Header */}

      <div
        className="
        mb-6
        flex
        items-center
        gap-3
      "
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm"
        >
          <ArrowLeft size={18} />
          ត្រឡប់
        </button>

        <h1
          className="
          text-xl
          font-bold
          text-primary
        "
        >
          បង្កើតឯកសារ
        </h1>
      </div>

      {/* Select Type */}

      {!type && (
        <div
          className="
          flex
          gap-5
        "
        >
          <button
            onClick={() => {
              setType("certificate");
            }}
            className="
            rounded-xl
            border
            px-10
            py-5
            text-sm
            hover:border-primary
            "
          >
            វិញ្ញាបនបត្រ
          </button>

          <button
            onClick={() => {
              setType("id_card");
            }}
            className="
            rounded-xl
            border
            px-10
            py-5
            text-sm
            hover:border-primary
            "
          >
            ប័ណ្ណសមាជិក
          </button>
        </div>
      )}

      {/* Certificate */}

      {type === "certificate" && (
        <CertificateForm
          form={form}
          setForm={setForm}
          onSave={() => {
            console.log(form);
          }}
          onClose={() => {
            setType("");
          }}
        />
      )}

      {/* ID Card */}

      {type === "id_card" && (
        <IdCardForm
          form={form}
          setForm={setForm}
          onSave={() => {
            console.log("ID card:", form);
          }}
          onClose={() => setType("")}
        />
      )}
    </div>
  );
}
