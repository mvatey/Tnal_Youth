"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CertificateForm from "@/app/document/CertificateForm";

export default function CertificatePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    branch: "",
    type: "វិញ្ញាបនបត្រ",
    gender: "ប្រុស",
    member: "",
    description: "",
    font: "Noto Sans",
    fontSize: "6px",
    color: "#12224c",
    language: "ភាសាខ្មែរ",
  });

  function handleSave() {
    console.log(form);
    router.push("/document/member");
  }

  return (
    <CertificateForm
      form={form}
      setForm={setForm}
      onSave={handleSave}
      onClose={() => router.back()}
    />
  );
}