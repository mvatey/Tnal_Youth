"use client";

import { useEffect, useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";

import useCurrentMember from "@/hooks/useCurrentMember";
import educationData from "@/data/education.json";

import SaveButton from "@/components/forms/SaveButton";
import DeleteButton from "@/components/forms/DeleteButton";
import FormSelect from "@/components/forms/FormSelect";
import ButtonDropLink from "@/components/forms/ButtonDropLink";

function createId(prefix) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function createLanguageSkill() {
  return {
    id: createId("language"),
    language: "",
    listening: "",
    reading: "",
    speaking: "",
    writing: "",
    documentLink: "",
  };
}

function createComputerSkill() {
  return {
    id: createId("computer"),
    skill: "",
    level: "",
    documentLink: "",
  };
}

function normalizeLanguageSkill(item) {
  return {
    ...createLanguageSkill(),
    ...(item || {}),

    documentLink:
      item?.documentLink ||
      item?.document_link ||
      item?.attachmentLink ||
      "",
  };
}

function normalizeComputerSkill(item) {
  return {
    ...createComputerSkill(),
    ...(item || {}),

    documentLink:
      item?.documentLink ||
      item?.document_link ||
      item?.attachmentLink ||
      "",
  };
}

export default function MyAccountSkillPage() {
  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [
    languageSkills,
    setLanguageSkills,
  ] = useState([]);

  const [
    computerSkills,
    setComputerSkills,
  ] = useState([]);

  useEffect(() => {
    if (!member) {
      setLanguageSkills([]);
      setComputerSkills([]);
      return;
    }

    const memberLanguages =
      Array.isArray(
        member.languageSkills,
      )
        ? member.languageSkills
        : [];

    const memberComputers =
      Array.isArray(
        member.computerSkills,
      )
        ? member.computerSkills
        : [];

    setLanguageSkills(
      memberLanguages.length > 0
        ? memberLanguages.map(
            normalizeLanguageSkill,
          )
        : [createLanguageSkill()],
    );

    setComputerSkills(
      memberComputers.length > 0
        ? memberComputers.map(
            normalizeComputerSkill,
          )
        : [createComputerSkill()],
    );
  }, [member]);

  const updateLanguage = (
    id,
    field,
    value,
  ) => {
    setLanguageSkills(
      (previous) =>
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

  const updateComputer = (
    id,
    field,
    value,
  ) => {
    setComputerSkills(
      (previous) =>
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

  const addLanguage = () => {
    setLanguageSkills(
      (previous) => [
        ...previous,
        createLanguageSkill(),
      ],
    );
  };

  const addComputer = () => {
    setComputerSkills(
      (previous) => [
        ...previous,
        createComputerSkill(),
      ],
    );
  };

  const removeLanguage = (id) => {
    setLanguageSkills(
      (previous) =>
        previous.length === 1
          ? previous
          : previous.filter(
              (item) =>
                item.id !== id,
            ),
    );
  };

  const removeComputer = (id) => {
    setComputerSkills(
      (previous) =>
        previous.length === 1
          ? previous
          : previous.filter(
              (item) =>
                item.id !== id,
            ),
    );
  };

  const handleSave = () => {
    const updatedMember = {
      ...member,
      languageSkills,
      computerSkills,
    };

    console.log(
      "Updated member skills:",
      updatedMember,
    );

    alert(
      "រក្សាទុកព័ត៌មានបានជោគជ័យ",
    );
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

  const levels =
    educationData.proficiencyLevels || [
      "ខ្សោយ",
      "មធ្យម",
      "ល្អ",
      "ល្អណាស់",
    ];

  return (
    <div className="space-y-4">
      {/* Language skills */}

      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-bold text-primary">
          ការប្រើប្រាស់ភាសាបរទេស
        </h2>

        <div className="mt-5 space-y-5">
          {languageSkills.map(
            (item, index) => (
              <LanguageSkillCard
                key={item.id}
                index={index}
                item={item}
                levels={levels}
                canDelete={
                  languageSkills.length >
                  1
                }
                onChange={(
                  field,
                  value,
                ) =>
                  updateLanguage(
                    item.id,
                    field,
                    value,
                  )
                }
                onDelete={() =>
                  removeLanguage(
                    item.id,
                  )
                }
              />
            ),
          )}
        </div>

        <AddButton
          onClick={addLanguage}
        />
      </section>

      {/* Computer skills */}

      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-bold text-primary">
          ការប្រើប្រាស់កម្មវិធីកុំព្យូទ័រ
        </h2>

        <div className="mt-5 space-y-5">
          {computerSkills.map(
            (item, index) => (
              <ComputerSkillCard
                key={item.id}
                index={index}
                item={item}
                levels={levels}
                canDelete={
                  computerSkills.length >
                  1
                }
                onChange={(
                  field,
                  value,
                ) =>
                  updateComputer(
                    item.id,
                    field,
                    value,
                  )
                }
                onDelete={() =>
                  removeComputer(
                    item.id,
                  )
                }
              />
            ),
          )}
        </div>

        <AddButton
          onClick={addComputer}
        />
      </section>

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
        />
      </div>
    </div>
  );
}

function LanguageSkillCard({
  index,
  item,
  levels,
  canDelete,
  onChange,
  onDelete,
}) {
  const skillFields = [
    {
      key: "listening",
      label: "ការស្ដាប់",
    },
    {
      key: "reading",
      label: "ការអាន",
    },
    {
      key: "speaking",
      label: "ការនិយាយ",
    },
    {
      key: "writing",
      label: "ការសរសេរ",
    },
  ];

  return (
    <div className="rounded-xl border border-gray-300 p-4 sm:p-5 lg:p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        ភាសាបរទេស ទី{" "}
        {index + 1}
      </h3>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <FormSelect
          label="ភាសា"
          name={`language-${item.id}`}
          value={
            item.language || ""
          }
          onChange={(event) =>
            onChange(
              "language",
              event.target.value,
            )
          }
          placeholder="ជ្រើសរើសភាសា"
          options={
            educationData.languages ||
            []
          }
        />

        {skillFields.map(
          (field) => (
            <FormSelect
              key={field.key}
              label={field.label}
              name={`${field.key}-${item.id}`}
              value={
                item[field.key] ||
                ""
              }
              onChange={(event) =>
                onChange(
                  field.key,
                  event.target.value,
                )
              }
              placeholder="ជ្រើសរើសកម្រិត"
              options={levels}
            />
          ),
        )}
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          តំណភ្ជាប់ឯកសារ
        </label>

        <ButtonDropLink
          value={
            item.documentLink ||
            ""
          }
          onChange={(value) =>
            onChange(
              "documentLink",
              value,
            )
          }
          placeholder="បញ្ចូលតំណភ្ជាប់វិញ្ញាបនបត្រភាសា"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <DeleteButton
          canDelete={
            canDelete
          }
          onClick={onDelete}
        />
      </div>
    </div>
  );
}

function ComputerSkillCard({
  index,
  item,
  levels,
  canDelete,
  onChange,
  onDelete,
}) {
  return (
    <div className="rounded-xl border border-gray-300 p-4 sm:p-5 lg:p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        ជំនាញកុំព្យូទ័រ ទី{" "}
        {index + 1}
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormSelect
          label="ជំនាញ"
          name={`computer-skill-${item.id}`}
          value={
            item.skill || ""
          }
          onChange={(event) =>
            onChange(
              "skill",
              event.target.value,
            )
          }
          placeholder="ជ្រើសរើសកម្មវិធី"
          options={
            educationData.computerSkills ||
            []
          }
        />

        <FormSelect
          label="កម្រិតជំនាញ"
          name={`computer-level-${item.id}`}
          value={
            item.level || ""
          }
          onChange={(event) =>
            onChange(
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

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          តំណភ្ជាប់ឯកសារ
        </label>

        <ButtonDropLink
          value={
            item.documentLink ||
            ""
          }
          onChange={(value) =>
            onChange(
              "documentLink",
              value,
            )
          }
          placeholder="បញ្ចូលតំណភ្ជាប់វិញ្ញាបនបត្រជំនាញ"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <DeleteButton
          canDelete={
            canDelete
          }
          onClick={onDelete}
        />
      </div>
    </div>
  );
}

function AddButton({
  onClick,
}) {
  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="
          inline-flex
          h-[34px]
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-success
          px-5
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-green-700
          active:scale-[0.99]
        "
      >
        <RiAddCircleLine
          size={17}
        />

        បន្ថែម
      </button>
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