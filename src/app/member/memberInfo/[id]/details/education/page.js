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
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";
import { useLanguage } from "@/context/LanguageContext";

import locationData from "@/data/location.json";
import educationData from "@/data/education.json";
import { deleteMemberRecord, loadMemberRecords, saveMemberRecords, uploadMemberRecordCertificate } from "@/lib/memberRecords";

function createEmptyEducation() {
  return {
    id: `edu-${Date.now()}`,
    ...educationData.emptyEducation,
  };
}

function isPersistedRecordId(id) {
  return Number.isInteger(Number(id)) && !String(id).includes("-");
}

/*
 * Puts saved rows back at their original position in the full list --
 * `savedSourceRows`/`completedRows` only cover the subset that was
 * actually sent to the server (see handleSubmit's blank-row filter),
 * so rows matched by id get the fresh server data and every other row
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

export default function EducationPage() {
  const { t, label } = useLanguage();
  const { canEditMemberDetails } = useMemberPermissions();
  const isReadOnly = !canEditMemberDetails;
  const params = useParams();
  const memberId = String(params?.id ?? "");

  // True until the initial education-records fetch settles (success or
  // failure) -- gates the render below so this page never flashes the
  // red "couldn't load" box during a normal load, only once loading has
  // actually finished and genuinely failed. The member itself is
  // already confirmed to exist by the shared layout before any tab
  // renders at all, so this page has no separate need to track it.
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [educations, setEducations] = useState([]);
  const [degreeOptions, setDegreeOptions] = useState([]);

  /*
   * True from the moment the user edits any education row (field
   * edit, add row) until the next successful Save — NOT derived from
   * diffing `educations`, since that state is also rewritten by the
   * load effect and after each save. Fed to useUnsavedFormGuard below
   * so the tab-nav bar knows to confirm before navigating away
   * mid-edit.
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
    setLoading(true);
    setLoadFailed(false);
    loadMemberRecords(memberId, "education", controller.signal)
      .then((rows) => {
        setEducations(rows.length ? rows.map((row) => ({ id: row.id, school: row.school_name || "", province: row.province_name || "", country: row.country_name || "", degree: row.education_level_id || "", startDate: row.start_date || "", endDate: row.end_date || "", attachment: row.certificate_file || null })) : [createEmptyEducation()]);
      })
      .catch((error) => { if (error.name !== "AbortError") setLoadFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
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
        label: label(item, item.code || ""),
      }))))
      .catch((error) => {
        if (error.name !== "AbortError") setDegreeOptions([]);
      });
    return () => controller.abort();
  }, [label]);

  function handleEducationChange(id, field, value) {
    setSuccess("");
    setHasUnsavedChanges(true);

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
    setSuccess("");
    setHasUnsavedChanges(true);

    setEducations((previous) => [
      ...previous,
      createEmptyEducation(),
    ]);
  }

  async function removeEducation(id) {
    // Fires an immediate DELETE against the server for persisted rows
    // (deleteMemberRecord no-ops for local-only draft rows) — there's
    // nothing left "unsaved" afterward, so this intentionally does
    // not set hasUnsavedChanges.
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
    event?.preventDefault();

    if (loading || loadFailed) return false;

    if (saving) return false;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * `educations` always carries at least one row by default (see
       * the load effect above) even when the member has no education
       * recorded yet. The backend requires school_name on every row
       * it's sent, so unconditionally saving that still-untouched
       * default row used to make the WHOLE save fail -- including
       * edits to other, fully-filled rows -- since it's a loop over
       * all of them. Only skip a row when it's both unsaved (no real
       * server id yet) AND still blank; an already-persisted row is
       * always sent so a genuine edit still gets validated normally.
       */
      const rowsToSave = educations.filter(
        (item) => isPersistedRecordId(item.id) || (item.school || "").trim(),
      );

      const rows = await saveMemberRecords(memberId, "education", rowsToSave, (item) => ({
        school_name: item.school,
        education_level_id: Number(item.degree) || null,
        field_of_study: item.fieldOfStudy || null,
        country_name: item.country || null,
        province_name: item.province || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
      }));
      const completedRows = await Promise.all(rows.map(async (row, index) => {
        const file = rowsToSave[index]?.attachment?.pendingFile;
        return file ? uploadMemberRecordCertificate(memberId, "education", row.id, file) : row;
      }));

      setEducations((previous) =>
        mergeSavedRecords(previous, rowsToSave, completedRows, (row) => ({ id: row.id, school: row.school_name || "", province: row.province_name || "", country: row.country_name || "", degree: row.education_level_id || "", fieldOfStudy: row.field_of_study || "", startDate: row.start_date || "", endDate: row.end_date || "", attachment: row.certificate_file || null })),
      );

      setHasUnsavedChanges(false);
      setSuccess(t("memberPage.saveSuccess"));

      return true;
    } catch (saveError) {
      console.error("Cannot save education records:", saveError);

      setError(saveError.message || t("memberPage.saveFailed"));

      return false;
    } finally {
      setSaving(false);
    }
  }

  /*
   * Registers this page's dirty flag + save function with the shared
   * unsaved-changes guard (see member/memberInfo/[id]/layout.js), so
   * the tab-nav bar confirms before navigating away while
   * hasUnsavedChanges is true.
   */
  useUnsavedFormGuard(hasUnsavedChanges, handleSubmit);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-text-secondary">
          {t("memberPage.loadingMember")}
        </p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="rounded-xl border border-error/30 bg-bg-page-white p-6">
        <p className="text-sm text-error">
          {t("memberPage.loadMemberFailed")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "member-readonly contents [&_button]:hidden" : "contents"}>
      <div className="rounded-xl border border-border bg-bg-page-white p-5">
        <div>
          <h2 className="text-lg font-bold text-primary">
            {t("memberPage.trainingLevel")}
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
              t={t}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            {t("memberPage.add")}
          </button>
        </div>
      </div>
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
          <SaveButton type="submit" disabled={saving}>
            {saving ? t("common.saving") : t("memberPage.save")}
          </SaveButton>
        </div>
      )}
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
  t,
}) {
  const provinces = Array.isArray(locationData.provinces)
    ? locationData.provinces
    : [];

  const countries = Array.isArray(locationData.countries)
    ? locationData.countries
    : [];

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        {t("memberPage.educationItemTitle").replace("{index}", index + 1)}
      </h3>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        <BoxFill
          label={t("memberPage.institution")}
          placeholder={t("memberPage.organizationPlaceholder")}
          value={education.school ?? ""}
          onChange={(event) =>
            onChange("school", event.target.value)
          }
        />

        <FormSelect
          label={t("memberPage.provinceState")}
          placeholder={t("memberPage.selectProvinceState")}
          value={education.province ?? ""}
          onChange={(event) =>
            onChange("province", event.target.value)
          }
          options={provinces}
        />

        <BoxFill
            label={t("memberPage.country")}
            placeholder={t("memberPage.countryFillPlaceholder")}
            value={education.country || ""}
            onChange={(event) =>
              onChange("country", event.target.value)
            }
          />

        <FormSelect
          label={t("memberPage.degreeLevel")}
          placeholder={t("memberPage.selectDegreeLevel")}
          value={education.degree ?? ""}
          onChange={(event) =>
            onChange("degree", event.target.value)
          }
          options={degrees}
        />

        <FormDate
          label={t("memberPage.startDate")}
          name={`startDate-${education.id}`}
          value={education.startDate ?? ""}
          onChange={(event) =>
            onChange("startDate", event.target.value)
          }
        />

        <FormDate
          label={t("memberPage.endDate")}
          name={`endDate-${education.id}`}
          value={education.endDate ?? ""}
          onChange={(event) =>
            onChange("endDate", event.target.value)
          }
        />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          {t("memberPage.attachDocument")}
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
