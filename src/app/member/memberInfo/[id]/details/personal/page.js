"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { UploadCloud } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import SelectArrow from "@/components/forms/SelectArrow";
import members from "@/data/members.json";

const EMPTY_FORM = {
  nameKh: "",
  nameEn: "",
  branch: "",
  gender: "",
  email: "",
  phone: "",
  nationality: "",
  ethnicity: "",
};

export default function PersonalPage() {
  const { id } = useParams();
  const fileRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const branchOptions = useMemo(() => {
    return [...new Set(members.map((member) => member.branch).filter(Boolean))];
  }, []);

  useEffect(() => {
    const selectedMember = members.find(
      (member) => String(member.id) === String(id),
    );

    if (!selectedMember) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      nameKh: selectedMember.name_kh || "",
      nameEn: selectedMember.name_en || "",
      branch: selectedMember.branch || "",
      gender: selectedMember.gender || "",
      email: selectedMember.email || "",
      phone: selectedMember.phone || "",
      nationality: selectedMember.nationality || "",
      ethnicity: selectedMember.ethnicity || "",
    });
  }, [id]);

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
      alert("ទំហំឯកសារមិនត្រូវលើស 5MB");
      event.target.value = "";
      return;
    }

    setFileName(file.name);
  };

  const handleSave = () => {
    console.log("Member ID:", id);
    console.log("Updated data:", form);
    console.log("Selected CV:", fileRef.current?.files?.[0] || null);

    alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">ព័ត៌មានផ្ទាល់ខ្លួន</h2>

        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 grid grid-cols-2 gap-5">
            <BoxFill
              label="ឈ្មោះជាភាសាខ្មែរ"
              name="nameKh"
              value={form.nameKh}
              onChange={handleChange("nameKh")}
              placeholder={form.nameKh ? "" : "បញ្ចូលឈ្មោះជាភាសាខ្មែរ"}
            />

            <BoxFill
              label="ឈ្មោះជាអក្សរឡាតាំង"
              name="nameEn"
              value={form.nameEn}
              onChange={handleChange("nameEn")}
              placeholder={form.nameEn ? "" : "បញ្ចូលឈ្មោះជាអក្សរឡាតាំង"}
            />

            <FormSelect
              label="សាខា"
              name="branch"
              value={form.branch}
              onChange={handleChange("branch")}
              placeholder={form.branch ? "" : "ជ្រើសរើសសាខា"}
              options={branchOptions}
            />

            <FormSelect
              label="ភេទ"
              name="gender"
              value={form.gender}
              onChange={handleChange("gender")}
              placeholder={form.gender ? "" : "ជ្រើសរើសភេទ"}
              options={["ប្រុស", "ស្រី"]}
            />

            <BoxFill
              label="អ៊ីមែល"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder={form.email ? "" : "បញ្ចូលអ៊ីមែល"}
            />

            <BoxFill
              label="លេខទូរស័ព្ទ"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder={form.phone ? "" : "បញ្ចូលលេខទូរស័ព្ទ"}
            />

            <BoxFill
              label="សញ្ជាតិ"
              name="nationality"
              value={form.nationality}
              onChange={handleChange("nationality")}
              placeholder={form.nationality ? "" : "បញ្ចូលសញ្ជាតិ"}
            />

            <BoxFill
              label="ជនជាតិ"
              name="ethnicity"
              value={form.ethnicity}
              onChange={handleChange("ethnicity")}
              placeholder={form.ethnicity ? "" : "បញ្ចូលជនជាតិ"}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              បញ្ចូល CV
            </label>

            <div className="flex h-[165px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <UploadCloud size={22} className="text-gray-400" />
              </div>

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

function FormSelect({ label, name, value, onChange, placeholder, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>

      <div className="relative">
        <select name={name} value={value} onChange={onChange} className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-600 outline-none focus:border-primary">
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <SelectArrow />
      </div>
    </div>
  );
}
