"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CertificateForm from "@/components/document/CertificateForm";
import IdCardForm from "@/components/document/IdCardForm";
import Button from "@/components/ui/Button";

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

      <div
        className="
        mb-6
        flex
        items-center
        gap-3
      "
      >
        <Button
          type="button"
          onClick={() => router.back()}
          variant="outline"
          icon={<ArrowLeft size={18} />}
          className="h-9"
        >
          ត្រឡប់
        </Button>

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
        <div
          className="
          flex
          gap-5
        "
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setType("certificate");
            }}
            className="h-auto px-10 py-5 hover:border-primary"
          >
            វិញ្ញាបនបត្រ
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setType("id_card");
            }}
            className="h-auto px-10 py-5 hover:border-primary"
          >
            ប័ណ្ណសមាជិក
          </Button>
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
     </div>
  );
}