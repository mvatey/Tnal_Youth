"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiAddCircleLine } from "react-icons/ri";
import FormSelect from "@/components/forms/FormSelect";

import SaveButton from "@/components/forms/SaveButton.js";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import DeleteButton from "@/components/forms/DeleteButton";

function createEmptyEducation() {
  return {
    id: `new-${crypto.randomUUID()}`,
    school: "",
    province: "",
    country: "KH",
    degree: "",
    fieldOfStudy: "",
    certificateFileId: null,
    startDate: "",
    endDate: "",
  };
}

export default function EducationPage() {
  const params = useParams();
  const memberId = String(params?.id ?? "");

  const [educations, setEducations] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [countries, setCountries] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEducations() {
      setIsLoading(true);
      setError("");
      try {
        const responses = await Promise.all([
          fetch(`/api/backend/members/${encodeURIComponent(memberId)}/education`, { cache: "no-store" }),
          fetch("/api/lookups/provinces", { cache: "no-store" }),
          fetch("/api/lookups/countries", { cache: "no-store" }),
          fetch("/api/lookups/education-levels", { cache: "no-store" }),
        ]);
        const failed = responses.find((response) => !response.ok);
        if (failed) {
          const problem = await failed.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load education history.");
        }
        const [records, provinceData, countryData, degreeData] =
          await Promise.all(responses.map((response) => response.json()));
        if (cancelled) return;

        setEducations(records.length ? records.map((record) => ({
          id: record.id,
          school: record.school_name || "",
          province: record.country_code === "KH"
            ? String(record.province_id ?? "")
            : record.province_name || "",
          country: record.country_code || "KH",
          degree: String(record.education_level_id ?? ""),
          fieldOfStudy: record.field_of_study || "",
          certificateFileId: record.certificate_file?.id ?? null,
          startDate: record.start_date || "",
          endDate: record.end_date || "",
        })) : [createEmptyEducation()]);
        setProvinces(provinceData.map((item) => ({
          value: String(item.value),
          label: item.labelKm || item.labelEn || item.code,
        })));
        setCountries(countryData.map((item) => ({
          value: item.value,
          label: item.labelKm || item.labelEn || item.code,
        })));
        setDegrees(degreeData.map((item) => ({
          value: String(item.value),
          label: item.labelKm || item.labelEn || item.code,
        })));
        setDeletedIds([]);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load education history.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadEducations();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  function handleEducationChange(id, field, value) {
    setEducations((previous) =>
      previous.map((education) =>
        education.id === id
          ? {
              ...education,
              [field]: value,
            }
          : education,
      ),
    );
  }

  function addEducation() {
    setEducations((previous) => [
      ...previous,
      createEmptyEducation(),
    ]);
  }

  function removeEducation(id) {
    if (typeof id === "number") setDeletedIds((previous) => [...previous, id]);
    setEducations((previous) => previous.filter((education) => education.id !== id));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const baseUrl = `/api/backend/members/${encodeURIComponent(memberId)}/education`;
      await Promise.all(deletedIds.map(async (educationId) => {
        const response = await fetch(`${baseUrl}/${educationId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Unable to delete an education record.");
      }));

      const saved = await Promise.all(educations.filter((item) => item.school.trim()).map(async (education) => {
        const existing = typeof education.id === "number";
        const country = countries.find((item) => item.value === education.country);
        const response = await fetch(existing ? `${baseUrl}/${education.id}` : baseUrl, {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            school_name: education.school.trim(),
            education_level_id: education.degree ? Number(education.degree) : null,
            field_of_study: education.fieldOfStudy.trim() || null,
            country_code: education.country,
            country_name: country?.label || education.country,
            province_id: education.country === "KH" && education.province ? Number(education.province) : null,
            province_name: education.country === "KH" ? null : education.province.trim() || null,
            certificate_file_id: education.certificateFileId,
            start_date: education.startDate || null,
            end_date: education.endDate || null,
          }),
        });
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to save education history.");
        }
        const record = await response.json();
        return {
          id: record.id,
          school: record.school_name || "",
          province: record.country_code === "KH" ? String(record.province_id ?? "") : record.province_name || "",
          country: record.country_code || "KH",
          degree: String(record.education_level_id ?? ""),
          fieldOfStudy: record.field_of_study || "",
          certificateFileId: record.certificate_file?.id ?? null,
          startDate: record.start_date || "",
          endDate: record.end_date || "",
        };
      }));

      setEducations(saved.length ? saved : [createEmptyEducation()]);
      setDeletedIds([]);
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (saveError) {
      setError(saveError.message || "Unable to save education history.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading education history...</div>;
  }

  if (error && educations.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-bold text-primary">
            កម្រិតការបណ្ដុះបណ្ដាល
          </h2>
        </div>

        <div className="mt-5 space-y-5">
          {educations.map((education, index) => (
            <EducationGroup
              key={education.id}
              index={index}
              education={education}
              canDelete
              provinces={provinces}
              countries={countries}
              degrees={degrees}
              onChange={(field, value) =>
                handleEducationChange(
                  education.id,
                  field,
                  value,
                )
              }
              onDelete={() =>
                removeEducation(education.id)
              }
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {error && <p className="mr-4 self-center text-sm text-red-600">{error}</p>}
        <SaveButton type="submit" disabled={isSaving} />
      </div>
    </form>
  );
}

function EducationGroup({
  index,
  education,
  canDelete,
  onDelete,
  onChange,
  provinces,
  countries,
  degrees,
}) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        ប្រវត្តិការសិក្សា ទី {index + 1}
      </h3>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        <BoxFill
          label="សាលា ឬ ស្ថាប័ន"
          placeholder="បញ្ចូលឈ្មោះសាលា ឬ ស្ថាប័ន"
          value={education.school ?? ""}
          onChange={(event) =>
            onChange("school", event.target.value)
          }
        />

        {education.country === "KH" ? (
          <FormSelect
            label="រាជធានី/ខេត្ត"
            placeholder="ជ្រើសរើសរាជធានី/ខេត្ត"
            value={education.province ?? ""}
            onChange={(event) => onChange("province", event.target.value)}
            options={provinces}
          />
        ) : (
          <BoxFill
            label="រាជធានី/ខេត្ត/រដ្ឋ"
            placeholder="បញ្ចូលរាជធានី/ខេត្ត/រដ្ឋ"
            value={education.province ?? ""}
            onChange={(event) => onChange("province", event.target.value)}
          />
        )}

        <FormSelect
          label="ប្រទេស"
          placeholder="ជ្រើសរើសប្រទេស"
          value={education.country ?? ""}
          onChange={(event) => {
            onChange("country", event.target.value);
            onChange("province", "");
          }}
          options={countries}
        />

        <FormSelect
          label="កម្រិតសញ្ញាប័ត្រ"
          placeholder="ជ្រើសរើសកម្រិតសញ្ញាប័ត្រ"
          value={education.degree ?? ""}
          onChange={(event) =>
            onChange("degree", event.target.value)
          }
          options={degrees}
        />

        <BoxFill
          label="ជំនាញ/មុខវិជ្ជា"
          placeholder="បញ្ចូលជំនាញ/មុខវិជ្ជា"
          value={education.fieldOfStudy ?? ""}
          onChange={(event) => onChange("fieldOfStudy", event.target.value)}
        />

        <FormDate
          label="ថ្ងៃចាប់ផ្តើម"
          name={`startDate-${education.id}`}
          value={education.startDate ?? ""}
          onChange={(event) =>
            onChange("startDate", event.target.value)
          }
        />

        <FormDate
          label="ថ្ងៃបញ្ចប់"
          name={`endDate-${education.id}`}
          value={education.endDate ?? ""}
          onChange={(event) =>
            onChange("endDate", event.target.value)
          }
        />
      </div>

      <div className="mt-6 flex justify-end">
  <DeleteButton
    canDelete={canDelete}
    onClick={onDelete}
  />
</div>
    </div>
  );
}
