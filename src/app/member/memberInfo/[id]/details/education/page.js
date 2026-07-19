"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import SaveButton from "@/components/forms/SaveButton.js";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import SelectArrow from "@/components/forms/SelectArrow";
import ButtonDropLink from "@/components/forms/ButtonDropLink";

import locationData from "@/data/location.json";
import educationData from "@/data/education.json";
import membersData from "@/data/members.json";

function createEmptyEducation() {
  return {
    id: `edu-${Date.now()}`,
    ...educationData.emptyEducation,
  };
}

export default function EducationPage() {
  const params = useParams();
  const memberId = String(params?.id ?? "");

  const [member, setMember] = useState(null);
  const [educations, setEducations] = useState([]);

  useEffect(() => {
    const selectedMember = membersData.find(
      (item) => String(item.id) === memberId,
    );

    if (!selectedMember) {
      setMember(null);
      setEducations([]);
      return;
    }

    setMember(selectedMember);

    const educationHistory = Array.isArray(
      selectedMember.educationHistory,
    )
      ? selectedMember.educationHistory
      : [];

    setEducations(
      educationHistory.length > 0
        ? educationHistory
        : [createEmptyEducation()],
    );
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
    setEducations((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter(
        (education) => education.id !== id,
      );
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!member) return;

    const updatedMember = {
      ...member,
      educationHistory: educations,
    };

    console.log("Updated member:", updatedMember);
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
    </form>
  );
}

function EducationGroup({
  index,
  education,
  canDelete,
  onDelete,
  onChange,
}) {
  const provinces = Array.isArray(locationData.provinces)
    ? locationData.provinces
    : [];

  const countries = Array.isArray(locationData.countries)
    ? locationData.countries
    : [];

  const degrees = Array.isArray(educationData.degrees)
    ? educationData.degrees
    : [];

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

        <FormSelect
          label="រាជធានី/ខេត្ត/រដ្ឋ"
          placeholder="ជ្រើសរើសរាជធានី/ខេត្ត/រដ្ឋ"
          value={education.province ?? ""}
          onChange={(event) =>
            onChange("province", event.target.value)
          }
          options={provinces}
        />

        <FormSelect
          label="ប្រទេស"
          placeholder="ជ្រើសរើសប្រទេស"
          value={education.country ?? ""}
          onChange={(event) =>
            onChange("country", event.target.value)
          }
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

        <div className="flex items-end">
          <ButtonDropLink
            value={education.documentLink ?? ""}
            onChange={(value) =>
              onChange("documentLink", value)
            }
          />
        </div>

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
        <button
          type="button"
          disabled={!canDelete}
          onClick={onDelete}
          className={`inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition ${
            canDelete
              ? "hover:bg-red-700"
              : "cursor-not-allowed opacity-60"
          }`}
        >
          <Trash2 size={17} />
          លុប
        </button>
      </div>
    </div>
  );
}

function FormSelect({
  label,
  placeholder,
  options = [],
  value = "",
  onChange,
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
          className={`h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-12 text-sm outline-none focus:border-primary ${
            value
              ? "text-text-primary"
              : "text-gray-500"
          }`}
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