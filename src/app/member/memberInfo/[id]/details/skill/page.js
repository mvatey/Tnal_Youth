"use client";

import { useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";
import FormSelect from "@/components/forms/FormSelect";
import educationData from "@/data/education.json";
import DeleteButton from "@/components/forms/DeleteButton";

function createLanguageSkill() {
  return {
    id: `language-${Date.now()}-${Math.random()}`,
    ...educationData.emptyLanguageSkill,
  };
}

function createComputerSkill() {
  return {
    id: `computer-${Date.now()}-${Math.random()}`,
    ...educationData.emptyComputerSkill,
  };
}

export default function SkillPage() {
  const [languageSkills, setLanguageSkills] = useState([createLanguageSkill()]);
  const [computerSkills, setComputerSkills] = useState([createComputerSkill()]);

  const updateLanguageSkill = (id, field, value) => {
    setLanguageSkills((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addLanguageSkill = () => {
    setLanguageSkills((previous) => [...previous, createLanguageSkill()]);
  };

  const removeLanguageSkill = (id) => {
    setLanguageSkills((previous) =>
      previous.length === 1
        ? previous
        : previous.filter((item) => item.id !== id),
    );
  };

  const updateComputerSkill = (id, field, value) => {
    setComputerSkills((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addComputerSkill = () => {
    setComputerSkills((previous) => [...previous, createComputerSkill()]);
  };

  const removeComputerSkill = (id) => {
    setComputerSkills((previous) =>
      previous.length === 1
        ? previous
        : previous.filter((item) => item.id !== id),
    );
  };

  const handleSave = () => {
    const data = {
      languageSkills,
      computerSkills,
    };

    console.log("Skill data:", data);
    alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">
          ការប្រើប្រាស់ភាសាបរទេស
        </h2>

        <div className="mt-5 space-y-5">
          {languageSkills.map((item) => (
            <LanguageSkillGroup
              key={item.id}
              item={item}
              canDelete={languageSkills.length > 1}
              onChange={(field, value) =>
                updateLanguageSkill(item.id, field, value)
              }
              onDelete={() => removeLanguageSkill(item.id)}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addLanguageSkill}
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
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
            <ComputerSkillGroup
              key={item.id}
              item={item}
              canDelete={computerSkills.length > 1}
              onChange={(field, value) =>
                updateComputerSkill(item.id, field, value)
              }
              onDelete={() => removeComputerSkill(item.id)}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addComputerSkill}
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
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

function LanguageSkillGroup({ item, canDelete, onChange, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <FormSelect
          label="ភាសា"
          placeholder="ជ្រើសរើសភាសា"
          value={item.language || ""}
          onChange={(event) => onChange("language", event.target.value)}
          options={educationData.languages || []}
        />
        <FormSelect
          label="ការស្ដាប់"
          placeholder="ជ្រើសរើសកម្រិត"
          value={item.listening || ""}
          onChange={(event) => onChange("listening", event.target.value)}
          options={
            educationData.listeningLevels ||
            educationData.proficiencyLevels ||
            []
          }
        />
        <FormSelect
          label="ការអាន"
          placeholder="ជ្រើសរើសកម្រិត"
          value={item.reading || ""}
          onChange={(event) => onChange("reading", event.target.value)}
          options={
            educationData.readingLevels || educationData.proficiencyLevels || []
          }
        />
        <FormSelect
          label="ការនិយាយ"
          placeholder="ជ្រើសរើសកម្រិត"
          value={item.speaking || ""}
          onChange={(event) => onChange("speaking", event.target.value)}
          options={
            educationData.speakingLevels ||
            educationData.proficiencyLevels ||
            []
          }
        />
        <FormSelect
          label="ការសរសេរ"
          placeholder="ជ្រើសរើសកម្រិត"
          value={item.writing || ""}
          onChange={(event) => onChange("writing", event.target.value)}
          options={
            educationData.writingLevels || educationData.proficiencyLevels || []
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

function ComputerSkillGroup({ item, canDelete, onChange, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormSelect
          label="ជំនាញ"
          placeholder="ជ្រើសរើសកម្មវិធី"
          value={item.skill || ""}
          onChange={(event) => onChange("skill", event.target.value)}
          options={educationData.computerSkills || []}
        />
        <FormSelect
          label="កម្រិតជំនាញ"
          placeholder="ជ្រើសរើសកម្រិតជំនាញ"
          value={item.level || ""}
          onChange={(event) => onChange("level", event.target.value)}
          options={educationData.computerSkillLevels || []}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={!canDelete}
          onClick={onDelete}
          className={`inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white ${
            canDelete ? "hover:bg-red-700" : "cursor-not-allowed"
          }`}
        >
          <Trash2 size={17} />
          លុប
        </button>
      </div>
    </div>
  );
}
