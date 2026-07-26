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

  recipientType: "member",

  memberId: "",
  member: "",

  activityId: "",
  activity: "",

  gender: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  role: "member",
  profilePhoto: "/profile.png",
  userId: "",

  templateFile: null,
  templatePreview: "",

  font: "Noto Sans",
  fontSize: "medium",
  color: "#12224c",
  language: "km",
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

      setForm((previous) => ({
        ...previous,
        type: "",
      }));

      return;
    }

    router.push("/document/member");
  };

  const handleSave = (createdData) => {
    console.log("Created document:", createdData || form);

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
    <div className="space-y-4">
      {/* Page header */}
      <div className="space-y-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => router.push("/document/member")}
            className="
              font-medium
              text-text-mute
              transition
              hover:text-primary
            "
          >
            បញ្ជីឯកសារ
          </button>

          <span className="text-base text-text-mute">
            ›
          </span>

          {type && (
            <>
              <button
                type="button"
                onClick={() => {
                  setType("");

                  setForm((previous) => ({
                    ...previous,
                    type: "",
                  }));
                }}
                className="
                  font-medium
                  text-text-mute
                  transition
                  hover:text-primary
                "
              >
                ប្រភេទឯកសារ
              </button>

              <span className="text-base text-text-mute">
                ›
              </span>
            </>
          )}

          <span className="font-semibold text-primary">
            {pageTitle}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-primary">
          {pageTitle}
        </h1>

        {/* Description */}
        <p className="text-sm text-text-secondary">
          {pageDescription}
        </p>
      </div>

      {/* Select document type */}
      {!type && (
        <div className="flex flex-wrap items-start gap-4">
          {/* Certificate card */}
          <div
            className="
              w-[270px]
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <div className="h-1 bg-primary" />

            <div className="flex h-[115px] flex-col justify-between p-4">
              <div>
                <h2 className="text-base font-bold text-primary">
                  វិញ្ញាបនបត្រ
                </h2>

                <p className="mt-1 text-xs text-text-secondary">
                  បង្កើតវិញ្ញាបនបត្រសម្រាប់សមាជិក ឬកម្មវិធី
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    selectDocumentType("certificate")
                  }
                  className="
                    inline-flex
                    h-8
                    min-w-[86px]
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary
                    px-3
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

          {/* ID card */}
          <div
            className="
              w-[270px]
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <div className="h-1 bg-warning" />

            <div className="flex h-[115px] flex-col justify-between p-4">
              <div>
                <h2 className="text-base font-bold text-primary">
                  ប័ណ្ណសមាជិក
                </h2>

                <p className="mt-1 text-xs text-text-secondary">
                  បង្កើតប័ណ្ណសម្គាល់សម្រាប់សមាជិក
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    selectDocumentType("id_card")
                  }
                  className="
                    inline-flex
                    h-8
                    min-w-[86px]
                    items-center
                    justify-center
                    rounded-lg
                    bg-warning
                    px-3
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