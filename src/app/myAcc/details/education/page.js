"use client";

import { useEffect, useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";

import useCurrentMember from "@/hooks/useCurrentMember";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";
import ButtonDropLink from "@/components/forms/ButtonDropLink";

import locationData from "@/data/location.json";
import educationData from "@/data/education.json";
import {
  fetchMyAccountCollection,
  saveMyAccountCollection,
} from "@/lib/myAccountCollections";

function createEmptyEducation() {
  return {
    id: `edu-${Date.now()}-${Math.random()}`,
    ...educationData.emptyEducation,
  };
}

export default function EducationPage() {
  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [educations, setEducations] = useState([]);
  const [originalEducations, setOriginalEducations] = useState([]);
  const [degreeOptions, setDegreeOptions] = useState([]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!member) {
      setEducations([]);
      return;
    }

    let active = true;
    fetchMyAccountCollection("education")
      .then((rows) => {
        if (!active) return;
        setOriginalEducations(rows);
        setEducations(rows.length ? rows.map((row) => ({
          id: row.id,
          school: row.school_name || "",
          province: row.province_name || "",
          country: row.country_name || "",
          degree: String(row.education_level_id || ""),
          fieldOfStudy: row.field_of_study || "",
          startDate: row.start_date || "",
          endDate: row.end_date || "",
          documentLink: row.certificate_file?.file_path || "",
        })) : [createEmptyEducation()]);
      })
      .catch((requestError) => setSaveError(requestError.message));
    return () => { active = false; };
  }, [member]);

  useEffect(() => {
    fetch("/api/lookups/education-levels", { cache: "no-store", credentials: "include" })
      .then((response) => response.ok ? response.json() : [])
      .then((items) => setDegreeOptions((Array.isArray(items) ? items : []).map((item) => ({
        value: String(item.value ?? item.id ?? ""),
        label: item.labelKm || item.label_km || item.labelEn || item.label_en || item.code || "",
      }))));
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

  function removeEducation(id) {
    setEducations((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter(
        (item) => item.id !== id,
      );
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaveError("");
      const current = educations.filter((item) => String(item.school || "").trim());
      const rows = await saveMyAccountCollection("education", originalEducations, current, (item) => ({
        school_name: item.school.trim(),
        education_level_id: Number(item.degree),
        field_of_study: item.fieldOfStudy?.trim() || null,
        country_name: item.country?.trim() || null,
        province_name: item.province?.trim() || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
      }));
      setOriginalEducations(rows);
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (requestError) {
      setSaveError(requestError.message);
    }
  }

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
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">
          កម្រិតការបណ្ដុះបណ្ដាល
        </h2>

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
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {saveError && <p className="mr-4 self-center text-sm text-red-500">{saveError}</p>}
        <SaveButton type="submit" />
      </div>
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
}) {
  const provinces = Array.isArray(
    locationData.provinces,
  )
    ? locationData.provinces
    : [];

  const countries = Array.isArray(
    locationData.countries,
  )
    ? locationData.countries
    : [];

  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        ប្រវត្តិការសិក្សា ទី {index + 1}
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
  <BoxFill
    label="ស្ថាប័ន"
    placeholder="បញ្ចូលឈ្មោះស្ថាប័ន"
    value={education.school || ""}
    onChange={(event) =>
      onChange("school", event.target.value)
    }
  />

  <FormSelect
    label="រាជធានី/ខេត្ត/រដ្ឋ"
    placeholder="ជ្រើសរើស"
    value={education.province || ""}
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
    placeholder="ជ្រើសរើស"
    value={education.degree || ""}
    onChange={(event) =>
      onChange("degree", event.target.value)
    }
    options={degrees}
  />

  <div className="flex flex-col">
    <label className="mb-2 block text-sm font-semibold text-text-primary">
      ឯកសារភ្ជាប់
    </label>

    <ButtonDropLink
      value={education.documentLink || ""}
      onChange={(value) =>
        onChange("documentLink", value)
      }
    />
  </div>

  <FormDate
    label="ថ្ងៃចាប់ផ្ដើម"
    name={`start-${education.id}`}
    value={education.startDate || ""}
    onChange={(event) =>
      onChange("startDate", event.target.value)
    }
  />

  <FormDate
    label="ថ្ងៃបញ្ចប់"
    name={`end-${education.id}`}
    value={education.endDate || ""}
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
