"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiAddCircleLine } from "react-icons/ri";
import SaveButton from "@/components/forms/SaveButton";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";
import BoxFill from "@/components/forms/boxFill";

function createLanguageSkill() {
  return {
    id: `new-${crypto.randomUUID()}`,
    language: "",
    listening: "",
    reading: "",
    speaking: "",
    writing: "",
  };
}

function createComputerSkill() {
  return {
    id: `new-${crypto.randomUUID()}`,
    skill: "",
    level: "",
  };
}

export default function SkillPage() {
  const { id } = useParams();
  const memberId = String(id ?? "");
  const [languageSkills, setLanguageSkills] = useState([createLanguageSkill()]);
  const [computerSkills, setComputerSkills] = useState([createComputerSkill()]);
  const [deletedLanguageIds, setDeletedLanguageIds] = useState([]);
  const [deletedSkillIds, setDeletedSkillIds] = useState([]);
  const [proficiencyOptions, setProficiencyOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      setIsLoading(true);
      setError("");
      try {
        const baseUrl = `/api/backend/members/${encodeURIComponent(memberId)}`;
        const responses = await Promise.all([
          fetch(`${baseUrl}/languages`, { cache: "no-store" }),
          fetch(`${baseUrl}/skills`, { cache: "no-store" }),
          fetch("/api/lookups/proficiency-levels", { cache: "no-store" }),
        ]);
        const failed = responses.find((response) => !response.ok);
        if (failed) {
          const problem = await failed.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load skills.");
        }
        const [languages, skills, levels] = await Promise.all(
          responses.map((response) => response.json()),
        );
        if (cancelled) return;

        setLanguageSkills(languages.length ? languages.map((item) => ({
          id: item.id,
          language: item.language_name || "",
          listening: String(item.listening_level_id ?? ""),
          reading: String(item.reading_level_id ?? ""),
          speaking: String(item.speaking_level_id ?? ""),
          writing: String(item.writing_level_id ?? ""),
        })) : [createLanguageSkill()]);
        setComputerSkills(skills.length ? skills.map((item) => ({
          id: item.id,
          skill: item.skill_name || "",
          level: String(item.proficiency_level_id ?? ""),
        })) : [createComputerSkill()]);
        setProficiencyOptions(levels.map((item) => ({
          value: String(item.value),
          label: item.labelKm || item.labelEn || item.code,
        })));
        setDeletedLanguageIds([]);
        setDeletedSkillIds([]);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load skills.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadSkills();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

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
    if (typeof id === "number") setDeletedLanguageIds((previous) => [...previous, id]);
    setLanguageSkills((previous) => previous.filter((item) => item.id !== id));
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
    if (typeof id === "number") setDeletedSkillIds((previous) => [...previous, id]);
    setComputerSkills((previous) => previous.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      const baseUrl = `/api/backend/members/${encodeURIComponent(memberId)}`;
      await Promise.all([
        ...deletedLanguageIds.map((recordId) => fetch(`${baseUrl}/languages/${recordId}`, { method: "DELETE" })),
        ...deletedSkillIds.map((recordId) => fetch(`${baseUrl}/skills/${recordId}`, { method: "DELETE" })),
      ].map(async (request) => {
        const response = await request;
        if (!response.ok) throw new Error("Unable to delete a skill record.");
      }));

      const savedLanguages = await Promise.all(languageSkills.filter((item) => item.language.trim()).map(async (item) => {
        const existing = typeof item.id === "number";
        const response = await fetch(existing ? `${baseUrl}/languages/${item.id}` : `${baseUrl}/languages`, {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language_name: item.language.trim(),
            listening_level_id: item.listening ? Number(item.listening) : null,
            speaking_level_id: item.speaking ? Number(item.speaking) : null,
            reading_level_id: item.reading ? Number(item.reading) : null,
            writing_level_id: item.writing ? Number(item.writing) : null,
          }),
        });
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to save language skills.");
        }
        const saved = await response.json();
        return {
          id: saved.id,
          language: saved.language_name || "",
          listening: String(saved.listening_level_id ?? ""),
          reading: String(saved.reading_level_id ?? ""),
          speaking: String(saved.speaking_level_id ?? ""),
          writing: String(saved.writing_level_id ?? ""),
        };
      }));

      const savedSkills = await Promise.all(computerSkills.filter((item) => item.skill.trim()).map(async (item) => {
        const existing = typeof item.id === "number";
        const response = await fetch(existing ? `${baseUrl}/skills/${item.id}` : `${baseUrl}/skills`, {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill_name: item.skill.trim(),
            proficiency_level_id: item.level ? Number(item.level) : null,
          }),
        });
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to save computer skills.");
        }
        const saved = await response.json();
        return {
          id: saved.id,
          skill: saved.skill_name || "",
          level: String(saved.proficiency_level_id ?? ""),
        };
      }));

      setLanguageSkills(savedLanguages.length ? savedLanguages : [createLanguageSkill()]);
      setComputerSkills(savedSkills.length ? savedSkills : [createComputerSkill()]);
      setDeletedLanguageIds([]);
      setDeletedSkillIds([]);
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (saveError) {
      setError(saveError.message || "Unable to save skills.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading skills...</div>;
  }

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
              canDelete
              proficiencyOptions={proficiencyOptions}
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
              canDelete
              proficiencyOptions={proficiencyOptions}
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
        {error && <p className="mr-4 self-center text-sm text-red-600">{error}</p>}
        <SaveButton onClick={handleSave} disabled={isSaving} />
      </div>
    </div>
  );
}

function LanguageSkillGroup({ item, canDelete, onChange, onDelete, proficiencyOptions }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <BoxFill
          label="ភាសា"
          placeholder="បញ្ចូលភាសា"
          value={item.language || ""}
          onChange={(event) => onChange("language", event.target.value)}
        />
        <FormSelect
          label="ការស្ដាប់"
          placeholder="ជ្រើសរើសកម្រិតការស្ដាប់"
          value={item.listening || ""}
          onChange={(event) => onChange("listening", event.target.value)}
          options={proficiencyOptions}
        />
        <FormSelect
          label="ការអាន"
          placeholder="ជ្រើសរើសកម្រិតការអាន"
          value={item.reading || ""}
          onChange={(event) => onChange("reading", event.target.value)}
          options={proficiencyOptions}
        />
        <FormSelect
          label="ការនិយាយ"
          placeholder="ជ្រើសរើសកម្រិតការនិយាយ"
          value={item.speaking || ""}
          onChange={(event) => onChange("speaking", event.target.value)}
          options={proficiencyOptions}
        />
        <FormSelect
          label="ការសរសេរ"
          placeholder="ជ្រើសរើសកម្រិតការសរសេរ"
          value={item.writing || ""}
          onChange={(event) => onChange("writing", event.target.value)}
          options={proficiencyOptions}
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

function ComputerSkillGroup({ item, canDelete, onChange, onDelete, proficiencyOptions }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BoxFill
          label="ជំនាញ"
          placeholder="បញ្ចូលកម្មវិធី ឬជំនាញ"
          value={item.skill || ""}
          onChange={(event) => onChange("skill", event.target.value)}
        />
        <FormSelect
          label="កម្រិតជំនាញ"
          placeholder="ជ្រើសរើសកម្រិតជំនាញ"
          value={item.level || ""}
          onChange={(event) => onChange("level", event.target.value)}
          options={proficiencyOptions}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <DeleteButton canDelete={canDelete} onClick={onDelete} />
      </div>
    </div>
  );
}
