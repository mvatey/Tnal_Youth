"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { UploadCloud } from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import SelectArrow from "@/components/forms/SelectArrow";
import FormDate from "@/components/forms/FormDate.js";

import members from "@/data/members.json";

export default function PersonalPage() {
  const { id } = useParams();

  const fileRef = useRef(null);

  const [member, setMember] = useState(null);

  const [fileName, setFileName] = useState("");

  const branchOptions = useMemo(() => {
    return [...new Set(members.map((item) => item.branch).filter(Boolean))];
  }, []);

  useEffect(() => {
    const selectedMember = members.find(
      (item) => String(item.id) === String(id),
    );

    if (!selectedMember) {
      setMember(null);

      return;
    }

    setMember({
      ...selectedMember,
    });
  }, [id]);

  const handleChange = (field) => (event) => {
    setMember((previous) => ({
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

    console.log("Updated member:", member);

    console.log("CV:", fileRef.current?.files?.[0] || null);

    alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
  };

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">រកមិនឃើញព័ត៌មានសមាជិក</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">ព័ត៌មានផ្ទាល់ខ្លួន</h2>

        <div className="mt-6 grid grid-cols-3 gap-6">
          {/* FORM */}

          <div className="col-span-2 grid grid-cols-2 gap-5">
            <BoxFill
              label="ឈ្មោះជាភាសាខ្មែរ"
              value={member.name_kh || ""}
              onChange={handleChange("name_kh")}
              placeholder={member.name_kh ? "" : "បញ្ចូលឈ្មោះជាភាសាខ្មែរ"}
            />

            <BoxFill
              label="ឈ្មោះជាអក្សរឡាតាំង"
              value={member.name_en || ""}
              onChange={handleChange("name_en")}
              placeholder={member.name_en ? "" : "បញ្ចូលឈ្មោះជាអក្សរឡាតាំង"}
            />

            <FormSelect
              label="សាខា"
              value={member.branch || ""}
              onChange={handleChange("branch")}
              placeholder="ជ្រើសរើសសាខា"
              options={branchOptions}
            />

            <FormSelect
              label="ភេទ"
              value={member.gender || ""}
              onChange={handleChange("gender")}
              placeholder="ជ្រើសរើសភេទ"
              options={["ប្រុស", "ស្រី"]}
            />

            <BoxFill
              label="អ៊ីមែល"
              type="email"
              value={member.email || ""}
              onChange={handleChange("email")}
              placeholder={member.email ? "" : "បញ្ចូលអ៊ីមែល"}
            />

            <BoxFill
              label="លេខទូរស័ព្ទ"
              type="tel"
              value={member.phone || ""}
              onChange={handleChange("phone")}
              placeholder={member.phone ? "" : "បញ្ចូលលេខទូរស័ព្ទ"}
            />

            <FormDate
              label="ថ្ងៃខែឆ្នាំកំណើត"
              name="date_of_birth"
              value={member.date_of_birth || ""}
              onChange={handleChange("date_of_birth")}
            />

            <BoxFill
              label="សញ្ជាតិ"
              value={member.nationality || ""}
              onChange={handleChange("nationality")}
              placeholder={member.nationality ? "" : "បញ្ចូលសញ្ជាតិ"}
            />

            <BoxFill
              label="ជនជាតិ"
              value={member.ethnicity || ""}
              onChange={handleChange("ethnicity")}
              placeholder={member.ethnicity ? "" : "បញ្ចូលជនជាតិ"}
            />
          </div>

          {/* CV UPLOAD */}

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

function FormSelect({
  label,

  value,

  onChange,

  placeholder,

  options = [],
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-600 outline-none focus:border-primary"
        >
          <option value="" disabled>
            {placeholder}
          </option>

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
