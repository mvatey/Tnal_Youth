"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import useCurrentMember from "@/hooks/useCurrentMember";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import FormSelect from "@/components/forms/FormSelect";

export default function MyAccountPersonalPage() {
  const fileRef = useRef(null);

  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [form, setForm] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!member) {
      setForm(null);
      return;
    }

    setForm({
      name_kh: member.name_kh || "",
      name_en: member.name_en || "",
      branch: member.branch || "",
      gender: member.gender || "",
      email: member.email || "",
      phone: member.phone || "",
      date_of_birth: member.date_of_birth || "",
      nationality: member.nationality || "",
      ethnicity: member.ethnicity || "",
    });
  }, [member]);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      return;
    }

    setFileName(file.name);
  };

  const handleSave = () => {
    console.log("Current member:", member);
    console.log("Updated account:", form);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!member || !form) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          គណនីនេះមិនទាន់ភ្ជាប់ជាមួយព័ត៌មានសមាជិកទេ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">
          ព័ត៌មានផ្ទាល់ខ្លួន
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-2">
            <BoxFill
              label="ឈ្មោះជាភាសាខ្មែរ"
              name="name_kh"
              value={form.name_kh}
              onChange={handleChange("name_kh")}
              placeholder="បញ្ចូលឈ្មោះជាភាសាខ្មែរ"
            />

            <BoxFill
              label="ឈ្មោះជាអក្សរឡាតាំង"
              name="name_en"
              value={form.name_en}
              onChange={handleChange("name_en")}
              placeholder="បញ្ចូលឈ្មោះជាអក្សរឡាតាំង"
            />

            <FormSelect
              label="សាខា"
              name="branch"
              value={form.branch}
              onChange={handleChange("branch")}
              placeholder="ជ្រើសរើសសាខា"
              options={[member.branch].filter(Boolean)}
            />

            <FormSelect
              label="ភេទ"
              name="gender"
              value={form.gender}
              onChange={handleChange("gender")}
              placeholder="ជ្រើសរើសភេទ"
              options={["ប្រុស", "ស្រី", "ព្រះសង្ឃ"]}
            />

            <BoxFill
              label="អ៊ីមែល"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="បញ្ចូលអ៊ីមែល"
            />

            <BoxFill
              label="លេខទូរស័ព្ទ"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
            />

            <FormDate
              label="ថ្ងៃខែឆ្នាំកំណើត"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange("date_of_birth")}
            />

            <BoxFill
              label="សញ្ជាតិ"
              name="nationality"
              value={form.nationality}
              onChange={handleChange("nationality")}
              placeholder="បញ្ចូលសញ្ជាតិ"
            />

            <BoxFill
              label="ជនជាតិ"
              name="ethnicity"
              value={form.ethnicity}
              onChange={handleChange("ethnicity")}
              placeholder="បញ្ចូលជនជាតិ"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              បញ្ចូល CV
            </label>

            <div className="flex h-[165px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 text-center">
              <UploadCloud
                size={22}
                className="mb-3 text-gray-400"
              />

              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm font-semibold text-primary hover:underline"
              >
                បញ្ចូលឯកសារ
              </button>

              <p className="mt-2 text-xs text-gray-400">
                JPG, DOCX, PDF, PNG (មិនលើស 5MB)
              </p>

              {fileName && (
                <p className="mt-2 max-w-[200px] truncate text-xs font-medium text-primary">
                  {fileName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} />
      </div>
    </div>
  );
}