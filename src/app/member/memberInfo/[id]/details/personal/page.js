"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { UploadCloud } from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import SelectArrow from "@/components/forms/SelectArrow";
import FormDate from "@/components/forms/FormDate.js";

export default function PersonalPage() {
  const { id } = useParams();

  const fileRef = useRef(null);

  const [member, setMember] = useState(null);
  const [fileName, setFileName] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [ethnicityOptions, setEthnicityOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const responses = await Promise.all([
          fetch(`/api/members/${encodeURIComponent(id)}`, { cache: "no-store" }),
          fetch("/api/lookups/branches", { cache: "no-store" }),
          fetch("/api/backend/nationalities", { cache: "no-store" }),
          fetch("/api/backend/ethnicities", { cache: "no-store" }),
        ]);
        const failed = responses.find((response) => !response.ok);

        if (failed) {
          const problem = await failed.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load member information.");
        }

        const [selectedMember, branches, nationalities, ethnicities] =
          await Promise.all(responses.map((response) => response.json()));

        if (cancelled) return;

        setMember({
          ...selectedMember,
          name_kh: selectedMember.full_name_km || "",
          name_en: selectedMember.full_name_en || "",
          branch: String(selectedMember.branch_id ?? ""),
          nationality: String(selectedMember.nationality?.id ?? ""),
          ethnicity: String(selectedMember.ethnicity?.id ?? ""),
          date_of_birth: selectedMember.date_of_birth || "",
        });
        setBranchOptions(branches.map((item) => ({
          value: String(item.value ?? item.id),
          label: item.labelKm || item.labelEn || item.code,
        })));
        setNationalityOptions(nationalities.map((item) => ({
          value: String(item.id),
          label: item.label_km || item.labelKm || item.nameKm || item.name || item.code,
        })));
        setEthnicityOptions(ethnicities.map((item) => ({
          value: String(item.id),
          label: item.label_km || item.labelKm || item.nameKm || item.name || item.code,
        })));
      } catch (loadError) {
        if (!cancelled) {
          setMember(null);
          setError(loadError.message || "Unable to load member information.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
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

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/members/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name_km: member.name_kh.trim(),
          full_name_en: member.name_en.trim() || null,
          gender: member.gender || null,
          nationality_id: member.nationality ? Number(member.nationality) : null,
          religion_id: member.religion?.id ?? null,
          ethnicity_id: member.ethnicity ? Number(member.ethnicity) : null,
          date_of_birth: member.date_of_birth || null,
          place_of_birth: member.place_of_birth || null,
          phone: member.phone?.trim() || null,
          email: member.email?.trim() || null,
          branch_id: member.branch ? Number(member.branch) : null,
          level_id: member.level?.id ?? null,
          status_id: member.status?.id ?? null,
          joined_on: member.joined_on || null,
          current_address: member.current_address || null,
          permanent_address: member.permanent_address || null,
          profile_photo_id: member.profile_photo?.id ?? null,
          cv_file_id: member.cv_file?.id ?? null,
          tshirt_size: member.tshirt_size || null,
          bio: member.bio || null,
        }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.message || "Unable to save member information.");
      }

      const savedMember = await response.json();
      setMember((previous) => ({
        ...previous,
        ...savedMember,
        name_kh: savedMember.full_name_km || "",
        name_en: savedMember.full_name_en || "",
        branch: String(savedMember.branch_id ?? ""),
        nationality: String(savedMember.nationality?.id ?? ""),
        ethnicity: String(savedMember.ethnicity?.id ?? ""),
        date_of_birth: savedMember.date_of_birth || "",
      }));
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (saveError) {
      setError(saveError.message || "Unable to save member information.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading member information...</div>;
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">{error || "រកមិនឃើញព័ត៌មានសមាជិក"}</p>
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

            <FormSelect
              label="សញ្ជាតិ"
              value={member.nationality || ""}
              onChange={handleChange("nationality")}
              placeholder="ជ្រើសរើសសញ្ជាតិ"
              options={nationalityOptions}
            />

            <FormSelect
              label="ជនជាតិ"
              value={member.ethnicity || ""}
              onChange={handleChange("ethnicity")}
              placeholder="ជ្រើសរើសជនជាតិ"
              options={ethnicityOptions}
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
        {error && <p className="mr-4 self-center text-sm text-red-600">{error}</p>}
        <SaveButton onClick={handleSave} disabled={isSaving} />
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
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>

        <SelectArrow />
      </div>
    </div>
  );
}
