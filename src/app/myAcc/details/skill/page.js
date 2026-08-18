"use client";

import { useEffect, useState } from "react";
import useCurrentMember from "@/hooks/useCurrentMember";
import { RiAddCircleLine } from "react-icons/ri";

import SaveButton from "@/components/forms/SaveButton";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";
import MemberAttachmentField from "@/components/forms/MemberAttachmentField";

import educationData from "@/data/education.json";
import { deleteMemberRecord, loadMemberRecords, removeMemberRecordCertificate, saveMemberRecords, uploadMemberRecordCertificate } from "@/lib/myAccountRecords";
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";

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
  const isReadOnly = false;
  const { member: currentMember } = useCurrentMember();
  const memberId = String(currentMember?.id ?? "self");
  const [languageSkills, setLanguageSkills] = useState([
    createLanguageSkill(),
  ]);

  const [computerSkills, setComputerSkills] = useState([
    createComputerSkill(),
  ]);
  const [proficiencyOptions, setProficiencyOptions] = useState([]);

  /*
   * True from the moment the user edits any language/computer skill
   * row (field edit or an add-row click) until the next successful
   * Save — NOT derived from diffing the skills arrays, since those
   * are also rewritten by the initial load effect. Removing a row
   * fires an immediate server DELETE (see removeLanguageSkill /
   * removeComputerSkill below), so it does not set this flag — there
   * is nothing "unsaved" pending after that request completes. Fed
   * to useUnsavedFormGuard below so the account tab-nav bar knows to
   * confirm before navigating away mid-edit.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      loadMemberRecords(memberId, "languages", controller.signal),
      loadMemberRecords(memberId, "skills", controller.signal),
    ]).then(([languages, skills]) => {
      setLanguageSkills(languages.length ? languages.map((row) => ({ id: row.id, language: row.language_name || "", listening: row.listening_level_id || "", speaking: row.speaking_level_id || "", reading: row.reading_level_id || "", writing: row.writing_level_id || "", attachment: row.certificate_file || null })) : [createLanguageSkill()]);
      setComputerSkills(skills.length ? skills.map((row) => ({ id: row.id, skill: row.skill_name || "", level: row.proficiency_level_id || "", attachment: row.certificate_file || null })) : [createComputerSkill()]);
    }).catch((error) => { if (error.name !== "AbortError") console.error(error); });
    return () => controller.abort();
  }, [memberId]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/lookups/proficiency-levels", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : [])
      .then((items) => setProficiencyOptions((Array.isArray(items) ? items : []).map((item) => ({
        value: String(item.value ?? item.id ?? ""),
        label: item.labelKm || item.label_km || item.labelEn || item.label_en || item.code || "",
      }))))
      .catch((error) => {
        if (error.name !== "AbortError") setProficiencyOptions([]);
      });
    return () => controller.abort();
  }, []);

  const updateLanguageSkill = (
    id,
    field,
    value,
  ) => {
    setHasUnsavedChanges(true);

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
    setHasUnsavedChanges(true);

    setLanguageSkills((previousSkills) => [
      ...previousSkills,
      createLanguageSkill(),
    ]);
  };

  const removeLanguageSkill = async (id) => {
    await deleteMemberRecord(memberId, "languages", id);
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
    setHasUnsavedChanges(true);

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
    setHasUnsavedChanges(true);

    setComputerSkills((previousSkills) => [
      ...previousSkills,
      createComputerSkill(),
    ]);
  };

  const removeComputerSkill = async (id) => {
    await deleteMemberRecord(memberId, "skills", id);
    setComputerSkills((previousSkills) => {
      if (previousSkills.length <= 1) {
        return previousSkills;
      }

      return previousSkills.filter(
        (item) => item.id !== id,
      );
    });
  };

  const handleSave = async () => {
    const [languages, skills] = await Promise.all([
      saveMemberRecords(memberId, "languages", languageSkills.filter((item) => String(item.language || "").trim()), (item) => ({ language_name: item.language.trim(), listening_level_id: Number(item.listening) || null, speaking_level_id: Number(item.speaking) || null, reading_level_id: Number(item.reading) || null, writing_level_id: Number(item.writing) || null })),
      saveMemberRecords(memberId, "skills", computerSkills.filter((item) => String(item.skill || "").trim()), (item) => ({ skill_name: item.skill.trim(), proficiency_level_id: Number(item.level) || null })),
    ]);
    const syncAttachments = (savedRows, sourceRows, resource) => Promise.all(
      savedRows.map(async (row, index) => {
        const attachment = sourceRows[index]?.attachment;
        if (attachment?.pendingFile) {
          return uploadMemberRecordCertificate(memberId, resource, row.id, attachment.pendingFile);
        }
        if (attachment?.removeExisting && attachment?.removedFileId) {
          return removeMemberRecordCertificate(memberId, resource, row.id);
        }
        return row;
      }),
    );
    const [completedLanguages, completedSkills] = await Promise.all([
      syncAttachments(languages, languageSkills, "languages"),
      syncAttachments(skills, computerSkills, "skills"),
    ]);
    setLanguageSkills(completedLanguages.map((row) => ({ id: row.id, language: row.language_name || "", listening: row.listening_level_id || "", speaking: row.speaking_level_id || "", reading: row.reading_level_id || "", writing: row.writing_level_id || "", attachment: row.certificate_file || null })));
    setComputerSkills(completedSkills.map((row) => ({ id: row.id, skill: row.skill_name || "", level: row.proficiency_level_id || "", attachment: row.certificate_file || null })));

    alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");

    setHasUnsavedChanges(false);

    return true;
  };

  /*
   * Registers this page's dirty flag + save function with the
   * shared unsaved-changes guard (see myAcc/layout.js), so the
   * account tab-nav bar confirms before navigating away while
   * hasUnsavedChanges is true.
   */
  useUnsavedFormGuard(hasUnsavedChanges, handleSave);

  return (
    <div className="space-y-4">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "member-readonly contents [&_button]:hidden" : "contents"}>
      {/* =====================================
          LANGUAGE SKILLS
      ===================================== */}

      <section
        className="
          rounded-xl
          border
          border-border
          bg-bg-page-white
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
              proficiencyOptions={proficiencyOptions}
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
              readOnly={isReadOnly}
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
          border-border
          bg-bg-page-white
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
              proficiencyOptions={proficiencyOptions}
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
              readOnly={isReadOnly}
            />
          ))}
        </div>

        <AddButton onClick={addComputerSkill} />
      </section>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} />
      </div>
      </fieldset>
    </div>
  );
}

function LanguageSkillGroup({
  index,
  item,
  proficiencyOptions,
  canDelete,
  onChange,
  onDelete,
  readOnly,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-border
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
          options={proficiencyOptions}
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
          options={proficiencyOptions}
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
          options={proficiencyOptions}
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
          options={proficiencyOptions}
        />
      </div>

      {/* Document link */}

      <div className="mt-5 border-t border-border pt-4">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          ភ្ជាប់ឯកសារ
        </label>

        <MemberAttachmentField
          value={item.attachment}
          onChange={(value) =>
            onChange(
              "attachment",
              value,
            )
          }
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

function ComputerSkillGroup({
  index,
  item,
  proficiencyOptions,
  canDelete,
  onChange,
  onDelete,
  readOnly,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-border
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
          options={proficiencyOptions}
        />
      </div>

      {/* Document link */}

      <div className="mt-5 border-t border-border pt-4">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          ភ្ជាប់ឯកសារ
        </label>

        <MemberAttachmentField
          value={item.attachment}
          onChange={(value) =>
            onChange(
              "attachment",
              value,
            )
          }
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
          bg-green-600
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
