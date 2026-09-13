"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiAddCircleLine } from "react-icons/ri";

import SaveButton from "@/components/forms/SaveButton";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";
import MemberAttachmentField from "@/components/forms/MemberAttachmentField";

import educationData from "@/data/education.json";
import { deleteMemberRecord, loadMemberRecords, removeMemberRecordCertificate, saveMemberRecords, uploadMemberRecordCertificate } from "@/lib/memberRecords";
import useMemberPermissions from "@/hooks/useMemberPermissions";
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";
import { useLanguage } from "@/context/LanguageContext";

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

function isPersistedRecordId(id) {
  return Number.isInteger(Number(id)) && !String(id).includes("-");
}

/*
 * Puts saved rows back at their original position in the full list --
 * `savedSourceRows`/`completedRows` only cover the subset that was
 * actually sent to the server (see handleSave's blank-row filter), so
 * rows matched by id get the fresh server data and every other row
 * (still-blank placeholders, mainly) is kept exactly as it was.
 */
function mergeSavedRecords(originalRows, savedSourceRows, completedRows, mapRow) {
  const completedById = new Map(
    savedSourceRows.map((row, index) => [row.id, completedRows[index]]),
  );

  return originalRows.map((row) => {
    const completed = completedById.get(row.id);
    return completed ? mapRow(completed) : row;
  });
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
  const { t, label } = useLanguage();
  const { canEditMemberDetails } = useMemberPermissions();
  const isReadOnly = !canEditMemberDetails;
  const memberId = String(useParams()?.id ?? "");
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
   * to useUnsavedFormGuard below so the tab-nav bar knows to confirm
   * before navigating away mid-edit.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /*
   * Guards the Save button (disabled while true) so a double-click or
   * a stray Enter-key submit can't fire a second save before the
   * first one's response comes back and turns each still-local row
   * into a persisted one -- without this, a second save would POST
   * the same unsaved row again as a brand new record.
   */
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        label: label(item, item.code || ""),
      }))))
      .catch((error) => {
        if (error.name !== "AbortError") setProficiencyOptions([]);
      });
    return () => controller.abort();
  }, [label]);

  const updateLanguageSkill = (
    id,
    field,
    value,
  ) => {
    setSuccess("");
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
    setSuccess("");
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
    setSuccess("");
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
    setSuccess("");
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
    if (saving) return false;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * Both lists always carry at least one row by default (see the
       * useState initializers / load effect above) even when the
       * member has no language or computer skills recorded yet. The
       * backend requires language_name / skill_name on every row it's
       * sent, so unconditionally saving that still-untouched default
       * row used to make EVERY save fail -- including edits to other,
       * fully-filled rows -- since it's one Promise.all. Only skip a
       * row when it's both unsaved (no real server id yet) AND still
       * blank; an already-persisted row is always sent so a genuine
       * edit still gets validated and surfaced normally.
       */
      const languageRowsToSave = languageSkills.filter(
        (item) => isPersistedRecordId(item.id) || (item.language || "").trim(),
      );

      const computerRowsToSave = computerSkills.filter(
        (item) => isPersistedRecordId(item.id) || (item.skill || "").trim(),
      );

      const [languages, skills] = await Promise.all([
        saveMemberRecords(memberId, "languages", languageRowsToSave, (item) => ({ language_name: item.language, listening_level_id: Number(item.listening) || null, speaking_level_id: Number(item.speaking) || null, reading_level_id: Number(item.reading) || null, writing_level_id: Number(item.writing) || null })),
        saveMemberRecords(memberId, "skills", computerRowsToSave, (item) => ({ skill_name: item.skill, proficiency_level_id: Number(item.level) || null })),
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
        syncAttachments(languages, languageRowsToSave, "languages"),
        syncAttachments(skills, computerRowsToSave, "skills"),
      ]);

      setLanguageSkills((previous) =>
        mergeSavedRecords(previous, languageRowsToSave, completedLanguages, (row) => ({ id: row.id, language: row.language_name || "", listening: row.listening_level_id || "", speaking: row.speaking_level_id || "", reading: row.reading_level_id || "", writing: row.writing_level_id || "", attachment: row.certificate_file || null })),
      );

      setComputerSkills((previous) =>
        mergeSavedRecords(previous, computerRowsToSave, completedSkills, (row) => ({ id: row.id, skill: row.skill_name || "", level: row.proficiency_level_id || "", attachment: row.certificate_file || null })),
      );

      setHasUnsavedChanges(false);
      setSuccess(t("memberPage.saveSuccess"));

      return true;
    } catch (saveError) {
      console.error("Cannot save language/computer skills:", saveError);

      setError(saveError.message || t("memberPage.saveFailed"));

      return false;
    } finally {
      setSaving(false);
    }
  };

  /*
   * Registers this page's dirty flag + save function with the
   * shared unsaved-changes guard (see
   * member/memberInfo/[id]/layout.js), so the tab-nav bar confirms
   * before navigating away while hasUnsavedChanges is true.
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
          {t("memberPage.foreignLanguage")}
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
              t={t}
            />
          ))}
        </div>

        <AddButton onClick={addLanguageSkill} text={t("memberPage.add")} />
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
          {t("memberPage.computerUse")}
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
              t={t}
            />
          ))}
        </div>

        <AddButton onClick={addComputerSkill} text={t("memberPage.add")} />
      </section>
      </fieldset>

      {error && (
        <div className="rounded-lg bg-error-bg px-4 py-3">
          <p className="text-sm font-medium text-error">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-bg px-4 py-3">
          <p className="text-sm font-medium text-success">{success}</p>
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-end">
          <SaveButton onClick={handleSave} disabled={saving}>
            {saving ? t("common.saving") : t("memberPage.save")}
          </SaveButton>
        </div>
      )}
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
  t,
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
        {t("memberPage.languageItemTitle").replace("{index}", index + 1)}
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
          label={t("memberPage.language")}
          name={`language-${item.id}`}
          placeholder={t("memberPage.selectLanguage")}
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
          label={t("memberPage.listening")}
          name={`listening-${item.id}`}
          placeholder={t("memberPage.selectListeningLevel")}
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
          label={t("memberPage.reading")}
          name={`reading-${item.id}`}
          placeholder={t("memberPage.selectReadingLevel")}
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
          label={t("memberPage.speaking")}
          name={`speaking-${item.id}`}
          placeholder={t("memberPage.selectSpeakingLevel")}
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
          label={t("memberPage.writing")}
          name={`writing-${item.id}`}
          placeholder={t("memberPage.selectWritingLevel")}
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
          {t("memberPage.attachDocument")}
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
  t,
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
        {t("memberPage.computerSkillItemTitle").replace("{index}", index + 1)}
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
          label={t("memberPage.skill")}
          name={`computer-skill-${item.id}`}
          placeholder={t("memberPage.selectProgram")}
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
          label={t("memberPage.skillLevel")}
          name={`computer-level-${item.id}`}
          placeholder={t("memberPage.selectSkillLevel")}
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
          {t("memberPage.attachDocument")}
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
  text,
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

        {text}
      </button>
    </div>
  );
}
