"use client";

import { useEffect, useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";

import useCurrentMember from "@/hooks/useCurrentMember";
import educationData from "@/data/education.json";

import SaveButton from "@/components/forms/SaveButton";
import DeleteButton from "@/components/forms/DeleteButton";
import FormSelect from "@/components/forms/FormSelect";

function createLanguageSkill() {
  return {
    id: `language-${Date.now()}-${Math.random()}`,
    language: "",
    listening: "",
    reading: "",
    speaking: "",
    writing: "",
  };
}

function createComputerSkill() {
  return {
    id: `computer-${Date.now()}-${Math.random()}`,
    skill: "",
    level: "",
  };
}

export default function MyAccountSkillPage() {
  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [languageSkills, setLanguageSkills] = useState([]);
  const [computerSkills, setComputerSkills] = useState([]);

  useEffect(() => {
    if (!member) {
      setLanguageSkills([]);
      setComputerSkills([]);
      return;
    }

    const memberLanguages = Array.isArray(member.languageSkills)
      ? member.languageSkills
      : [];

    const memberComputers = Array.isArray(member.computerSkills)
      ? member.computerSkills
      : [];

    setLanguageSkills(
      memberLanguages.length > 0
        ? memberLanguages
        : [createLanguageSkill()],
    );

    setComputerSkills(
      memberComputers.length > 0
        ? memberComputers
        : [createComputerSkill()],
    );
  }, [member]);

  const updateLanguage = (id, field, value) => {
    setLanguageSkills((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const updateComputer = (id, field, value) => {
    setComputerSkills((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const removeLanguage = (id) => {
    setLanguageSkills((previous) =>
      previous.length === 1
        ? previous
        : previous.filter(
            (item) => item.id !== id,
          ),
    );
  };

  const removeComputer = (id) => {
    setComputerSkills((previous) =>
      previous.length === 1
        ? previous
        : previous.filter(
            (item) => item.id !== id,
          ),
    );
  };

  const handleSave = () => {
    console.log({
      memberId: member?.id,
      languageSkills,
      computerSkills,
    });
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

  if (!member) {
    return <NotFound />;
  }

  const levels = educationData.proficiencyLevels || [
    "ខ្សោយ",
    "មធ្យម",
    "ល្អ",
    "ល្អណាស់",
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">
          ការប្រើប្រាស់ភាសាបរទេស
        </h2>

        <div className="mt-5 space-y-5">
          {languageSkills.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-300 p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                <FormSelect
                  label="ភាសា"
                  value={item.language || ""}
                  onChange={(event) =>
                    updateLanguage(
                      item.id,
                      "language",
                      event.target.value,
                    )
                  }
                  placeholder="ជ្រើសរើសភាសា"
                  options={educationData.languages || []}
                />

                {[
                  "listening",
                  "reading",
                  "speaking",
                  "writing",
                ].map((field) => {
                  const labels = {
                    listening: "ការស្ដាប់",
                    reading: "ការអាន",
                    speaking: "ការនិយាយ",
                    writing: "ការសរសេរ",
                  };

                  return (
                    <FormSelect
                      key={field}
                      label={labels[field]}
                      value={item[field] || ""}
                      onChange={(event) =>
                        updateLanguage(
                          item.id,
                          field,
                          event.target.value,
                        )
                      }
                      placeholder="ជ្រើសរើសកម្រិត"
                      options={levels}
                    />
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton
                  canDelete={languageSkills.length > 1}
                  onClick={() =>
                    removeLanguage(item.id)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setLanguageSkills((previous) => [
                ...previous,
                createLanguageSkill(),
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">
          ការប្រើប្រាស់កម្មវិធីកុំព្យូទ័រ
        </h2>

        <div className="mt-5 space-y-5">
          {computerSkills.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-300 p-6"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSelect
                  label="ជំនាញ"
                  value={item.skill || ""}
                  onChange={(event) =>
                    updateComputer(
                      item.id,
                      "skill",
                      event.target.value,
                    )
                  }
                  placeholder="ជ្រើសរើសកម្មវិធី"
                  options={educationData.computerSkills || []}
                />

                <FormSelect
                  label="កម្រិតជំនាញ"
                  value={item.level || ""}
                  onChange={(event) =>
                    updateComputer(
                      item.id,
                      "level",
                      event.target.value,
                    )
                  }
                  placeholder="ជ្រើសរើសកម្រិត"
                  options={
                    educationData.computerSkillLevels ||
                    levels
                  }
                />
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton
                  canDelete={computerSkills.length > 1}
                  onClick={() =>
                    removeComputer(item.id)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setComputerSkills((previous) => [
                ...previous,
                createComputerSkill(),
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <p className="text-sm text-red-500">
        រកមិនឃើញព័ត៌មានសមាជិក
      </p>
    </div>
  );
}