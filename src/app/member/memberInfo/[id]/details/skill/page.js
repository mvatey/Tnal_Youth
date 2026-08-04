"use client";

import { useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";

import SaveButton from "@/components/forms/SaveButton";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";
import ButtonDropLink from "@/components/forms/ButtonDropLink";

import educationData from "@/data/education.json";

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
    ...educationData.emptyLanguageSkill,

    language:
      educationData.emptyLanguageSkill?.language || "",

    listening:
      educationData.emptyLanguageSkill?.listening || "",

    reading:
      educationData.emptyLanguageSkill?.reading || "",

    speaking:
      educationData.emptyLanguageSkill?.speaking || "",

    writing:
      educationData.emptyLanguageSkill?.writing || "",

    documentLink:
      educationData.emptyLanguageSkill?.documentLink || "",
  };
}

function createComputerSkill() {
  return {
    id: createId("computer"),
    ...educationData.emptyComputerSkill,

    skill:
      educationData.emptyComputerSkill?.skill || "",

    level:
      educationData.emptyComputerSkill?.level || "",

    documentLink:
      educationData.emptyComputerSkill?.documentLink || "",
  };
}

export default function SkillPage() {
  const [languageSkills, setLanguageSkills] = useState([
    createLanguageSkill(),
  ]);

  const [computerSkills, setComputerSkills] = useState([
    createComputerSkill(),
  ]);

  const updateLanguageSkill = (
    id,
    field,
    value,
  ) => {
    setLanguageSkills((previousSkills) =>
      previousSkills.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addLanguageSkill = () => {
    setLanguageSkills((previousSkills) => [
      ...previousSkills,
      createLanguageSkill(),
    ]);
  };

  const removeLanguageSkill = (id) => {
    setLanguageSkills((previousSkills) => {
      if (previousSkills.length <= 1) {
        return previousSkills;
      }

      return previousSkills.filter(
        (item) => item.id !== id,
      );
    });
  };

  const updateComputerSkill = (
    id,
    field,
    value,
  ) => {
    setComputerSkills((previousSkills) =>
      previousSkills.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addComputerSkill = () => {
    setComputerSkills((previousSkills) => [
      ...previousSkills,
      createComputerSkill(),
    ]);
  };

  const removeComputerSkill = (id) => {
    setComputerSkills((previousSkills) => {
      if (previousSkills.length <= 1) {
        return previousSkills;
      }

      return previousSkills.filter(
        (item) => item.id !== id,
      );
    });
  };

  const handleSave = () => {
    const skillData = {
      languageSkills,
      computerSkills,
    };

    console.log("Skill data:", skillData);

    alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
  };

  return (
    <div className="space-y-4">
      {/* =====================================
          LANGUAGE SKILLS
      ===================================== */}

      <section
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
          sm:p-5
        "
      >
        <h2 className="text-lg font-bold text-primary">
          ការប្រើប្រាស់ភាសាបរទេស
        </h2>

        <div className="mt-5 space-y-5">
          {languageSkills.map((item, index) => (
            <LanguageSkillGroup
              key={item.id}
              index={index}
              item={item}
              canDelete={languageSkills.length > 1}
              onChange={(field, value) =>
                updateLanguageSkill(
                  item.id,
                  field,
                  value,
                )
              }
              onDelete={() =>
                removeLanguageSkill(item.id)
              }
            />
          ))}
        </div>

        <AddButton onClick={addLanguageSkill} />
      </section>

      {/* =====================================
          COMPUTER SKILLS
      ===================================== */}

      <section
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
          sm:p-5
        "
      >
        <h2 className="text-lg font-bold text-primary">
          ការប្រើប្រាស់កម្មវិធីកុំព្យូទ័រ
        </h2>

        <div className="mt-5 space-y-5">
          {computerSkills.map((item, index) => (
            <ComputerSkillGroup
              key={item.id}
              index={index}
              item={item}
              canDelete={computerSkills.length > 1}
              onChange={(field, value) =>
                updateComputerSkill(
                  item.id,
                  field,
                  value,
                )
              }
              onDelete={() =>
                removeComputerSkill(item.id)
              }
            />
          ))}
        </div>

        <AddButton onClick={addComputerSkill} />
      </section>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} />
      </div>
    </div>
  );
}

function LanguageSkillGroup({
  index,
  item,
  canDelete,
  onChange,
  onDelete,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-gray-300
        p-4
        sm:p-5
        lg:p-6
      "
    >
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        ភាសាបរទេស ទី {index + 1}
      </h3>

      <div
        className="
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          xl:grid-cols-5
        "
      >
        <FormSelect
          label="ភាសា"
          name={`language-${item.id}`}
          placeholder="ជ្រើសរើសភាសា"
          value={item.language || ""}
          onChange={(event) =>
            onChange(
              "language",
              event.target.value,
            )
          }
          options={educationData.languages || []}
        />

        <FormSelect
          label="ការស្ដាប់"
          name={`listening-${item.id}`}
          placeholder="ជ្រើសរើសកម្រិតការស្ដាប់"
          value={item.listening || ""}
          onChange={(event) =>
            onChange(
              "listening",
              event.target.value,
            )
          }
          options={
            educationData.listeningLevels ||
            educationData.proficiencyLevels ||
            []
          }
        />

        <FormSelect
          label="ការអាន"
          name={`reading-${item.id}`}
          placeholder="ជ្រើសរើសកម្រិតការអាន"
          value={item.reading || ""}
          onChange={(event) =>
            onChange(
              "reading",
              event.target.value,
            )
          }
          options={
            educationData.readingLevels ||
            educationData.proficiencyLevels ||
            []
          }
        />

        <FormSelect
          label="ការនិយាយ"
          name={`speaking-${item.id}`}
          placeholder="ជ្រើសរើសកម្រិតការនិយាយ"
          value={item.speaking || ""}
          onChange={(event) =>
            onChange(
              "speaking",
              event.target.value,
            )
          }
          options={
            educationData.speakingLevels ||
            educationData.proficiencyLevels ||
            []
          }
        />

        <FormSelect
          label="ការសរសេរ"
          name={`writing-${item.id}`}
          placeholder="ជ្រើសរើសកម្រិតការសរសេរ"
          value={item.writing || ""}
          onChange={(event) =>
            onChange(
              "writing",
              event.target.value,
            )
          }
          options={
            educationData.writingLevels ||
            educationData.proficiencyLevels ||
            []
          }
        />
      </div>

      {/* Document link */}

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          តំណភ្ជាប់ឯកសារ
        </label>

        <ButtonDropLink
          value={item.documentLink || ""}
          onChange={(value) =>
            onChange(
              "documentLink",
              value,
            )
          }
          placeholder="បញ្ចូលតំណភ្ជាប់វិញ្ញាបនបត្រ ឬឯកសារភាសា"
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

function ComputerSkillGroup({
  index,
  item,
  canDelete,
  onChange,
  onDelete,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-gray-300
        p-4
        sm:p-5
        lg:p-6
      "
    >
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        ជំនាញកុំព្យូទ័រ ទី {index + 1}
      </h3>

      <div
        className="
          grid
          grid-cols-1
          gap-5
          md:grid-cols-2
        "
      >
        <FormSelect
          label="ជំនាញ"
          name={`computer-skill-${item.id}`}
          placeholder="ជ្រើសរើសកម្មវិធី"
          value={item.skill || ""}
          onChange={(event) =>
            onChange(
              "skill",
              event.target.value,
            )
          }
          options={
            educationData.computerSkills || []
          }
        />

        <FormSelect
          label="កម្រិតជំនាញ"
          name={`computer-level-${item.id}`}
          placeholder="ជ្រើសរើសកម្រិតជំនាញ"
          value={item.level || ""}
          onChange={(event) =>
            onChange(
              "level",
              event.target.value,
            )
          }
          options={
            educationData.computerSkillLevels || []
          }
        />
      </div>

      {/* Document link */}

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          តំណភ្ជាប់ឯកសារ
        </label>

        <ButtonDropLink
          value={item.documentLink || ""}
          onChange={(value) =>
            onChange(
              "documentLink",
              value,
            )
          }
          placeholder="បញ្ចូលតំណភ្ជាប់វិញ្ញាបនបត្រ ឬឯកសារជំនាញ"
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
        <RiAddCircleLine size={17} />

        បន្ថែម
      </button>
    </div>
  );
}