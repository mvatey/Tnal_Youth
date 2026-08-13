"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";
import FormSelect from "@/components/forms/FormSelect";

import SaveButton from "@/components/forms/SaveButton.js";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import SelectArrow from "@/components/forms/SelectArrow";
import DeleteButton from "@/components/forms/DeleteButton";
import MemberAttachmentField from "@/components/forms/MemberAttachmentField";
import useMemberPermissions from "@/hooks/useMemberPermissions";

import locationData from "@/data/location.json";
import educationData from "@/data/education.json";
import { deleteMemberRecord, loadMemberRecords, saveMemberRecords, uploadMemberRecordCertificate } from "@/lib/memberRecords";

function createEmptyEducation() {
  return {
    id: `edu-${Date.now()}`,
    ...educationData.emptyEducation,
  };
}

export default function EducationPage() {
  const { canEditMemberDetails } = useMemberPermissions();
  const isReadOnly = !canEditMemberDetails;
  const params = useParams();
  const memberId = String(params?.id ?? "");

  const [member, setMember] = useState(null);
  const [educations, setEducations] = useState([]);
  const [degreeOptions, setDegreeOptions] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    loadMemberRecords(memberId, "education", controller.signal)
      .then((rows) => {
        setMember({ id: memberId });
        setEducations(rows.length ? rows.map((row) => ({ id: row.id, school: row.school_name || "", province: row.province_name || "", country: row.country_name || "", degree: row.education_level_id || "", startDate: row.start_date || "", endDate: row.end_date || "", attachment: row.certificate_file || null })) : [createEmptyEducation()]);
      })
      .catch((error) => { if (error.name !== "AbortError") setMember(null); });
    return () => controller.abort();
  }, [memberId]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/lookups/education-levels", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : [])
      .then((items) => setDegreeOptions((Array.isArray(items) ? items : []).map((item) => ({
        value: String(item.value ?? item.id ?? ""),
        label: item.labelKm || item.label_km || item.labelEn || item.label_en || item.code || "",
      }))))
      .catch((error) => {
        if (error.name !== "AbortError") setDegreeOptions([]);
      });
    return () => controller.abort();
  }, []);

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

  async function removeEducation(id) {
    await deleteMemberRecord(memberId, "education", id);
    setEducations((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter(
        (education) => education.id !== id,
      );
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!member) return;

    const rows = await saveMemberRecords(memberId, "education", educations, (item) => ({
      school_name: item.school,
      education_level_id: Number(item.degree),
      field_of_study: item.fieldOfStudy || null,
      country_name: item.country || null,
      province_name: item.province || null,
      start_date: item.startDate || null,
      end_date: item.endDate || null,
    }));
    const completedRows = await Promise.all(rows.map(async (row, index) => {
      const file = educations[index]?.attachment?.pendingFile;
      return file ? uploadMemberRecordCertificate(memberId, "education", row.id, file) : row;
    }));
    setEducations(completedRows.map((row) => ({ id: row.id, school: row.school_name || "", province: row.province_name || "", country: row.country_name || "", degree: row.education_level_id || "", fieldOfStudy: row.field_of_study || "", startDate: row.start_date || "", endDate: row.end_date || "", attachment: row.certificate_file || null })));
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          រកមិនឃើញព័ត៌មានសមាជិក
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "member-readonly contents [&_button]:hidden" : "contents"}>
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
              degrees={degreeOptions}
              canDelete={educations.length > 1}
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
              readOnly={isReadOnly}
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
        <SaveButton type="submit" />
      </div>
      </fieldset>
    </form>
  );
}

function EducationGroup({
  index,
  education,
  degrees,
  canDelete,
  onDelete,
  onChange,
  readOnly,
}) {
  const provinces = Array.isArray(locationData.provinces)
    ? locationData.provinces
    : [];

  const countries = Array.isArray(locationData.countries)
    ? locationData.countries
    : [];

  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        ប្រវត្តិការសិក្សា ទី {index + 1}
      </h3>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        <BoxFill
          label="ស្ថាប័ន"
          placeholder="បញ្ចូលឈ្មោះស្ថាប័ន"
          value={education.school ?? ""}
          onChange={(event) =>
            onChange("school", event.target.value)
          }
        />

        <FormSelect
          label="រាជធានី/ខេត្ត/រដ្ឋ"
          placeholder="ជ្រើសរើសរាជធានី/ខេត្ត/រដ្ឋ"
          value={education.province ?? ""}
          onChange={(event) =>
            onChange("province", event.target.value)
          }
          options={provinces}
        />

        <BoxFill
            label="ប្រទេស"
            placeholder="បំពេញឈ្មោះប្រទេស"
            value={education.country || ""}
            onChange={(event) =>
              onChange("country", event.target.value)
            }
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

      <div className="mt-5 border-t border-gray-100 pt-4">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          ភ្ជាប់ឯកសារ
        </label>
        <MemberAttachmentField
          value={education.attachment}
          onChange={(value) => onChange("attachment", value)}
          readOnly={readOnly}
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
